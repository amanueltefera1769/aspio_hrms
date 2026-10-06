// A still picture with an offline depth map, drawn only while the camera moves.
// Nearer pixels magnify faster than farther ones, which reads as the camera moving
// through the scene rather than a flat zoom. A radial blur and a soft bloom carry
// the single cut between the overview and a close-up. No continuous rendering.
export type DepthUniforms = { parallax: number; blur: number; bloom: number; focus: [number, number] };
export type DepthLayer = { draw: (uniforms: DepthUniforms) => void; dispose: () => void };

const vertex = `attribute vec2 p; varying vec2 v;
void main() { v = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }`;
const fragment = `precision mediump float;
varying vec2 v;
uniform sampler2D img, dep;
uniform vec2 focus;
uniform float parallax, blur, bloom;
void main() {
  float d0 = texture2D(dep, focus).r;
  // Only what is nearer than the subject moves; the subject itself stays put.
  float m = 1. + parallax * max(0., texture2D(dep, v).r - d0);
  vec2 uv = focus + (v - focus) / m;
  vec3 c = vec3(0.);
  if (blur > .001) {
    for (int i = 0; i < 12; i++) c += texture2D(img, clamp(focus + (uv - focus) * (1. - blur * float(i) / 11.), 0., 1.)).rgb;
    c /= 12.;
  } else c = texture2D(img, clamp(uv, 0., 1.)).rgb;
  c = mix(c, vec3(1.), bloom * (.6 + .4 * (1. - distance(v, focus))));
  gl_FragColor = vec4(c, 1.);
}`;

const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new window.Image();
  image.onload = () => image.decode().then(() => resolve(image), reject);
  image.onerror = () => reject(new Error(`Could not load ${src}`));
  image.src = src;
});

export async function createDepthLayer(canvas: HTMLCanvasElement, src: string, depthSrc: string): Promise<DepthLayer | null> {
  const options = { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: "low-power" } as const;
  const gl2 = canvas.getContext("webgl2", options);
  const gl = (gl2 ?? canvas.getContext("webgl", options)) as WebGLRenderingContext | null;
  if (!gl) return null;
  const [image, depth] = await Promise.all([load(src), load(depthSrc)]);
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "Shader failed");
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const texture = (unit: number, source: HTMLImageElement, name: string, mipmaps: boolean) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // WebGL2 can mipmap non-power-of-two pictures, which keeps a downscaled frame crisp.
    if (mipmaps) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, name), unit);
  };
  texture(0, image, "img", Boolean(gl2));
  texture(1, depth, "dep", false);
  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const [focus, parallax, blur, bloom] = ["focus", "parallax", "blur", "bloom"].map(uniform);
  let lost = false;
  const onLost = (event: Event) => { event.preventDefault(); lost = true; delete canvas.dataset.ready; };
  canvas.addEventListener("webglcontextlost", onLost);
  const draw = (values: DepthUniforms) => {
    if (lost) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const [width, height] = [Math.round(canvas.clientWidth * ratio), Math.round(canvas.clientHeight * ratio)];
    if (width && height && (canvas.width !== width || canvas.height !== height)) { canvas.width = width; canvas.height = height; }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(focus, values.focus[0], values.focus[1]);
    gl.uniform1f(parallax, values.parallax);
    gl.uniform1f(blur, values.blur);
    gl.uniform1f(bloom, values.bloom);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  draw({ parallax: 0, blur: 0, bloom: 0, focus: [.5, .5] });
  canvas.dataset.ready = "true";
  return {
    draw,
    dispose: () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      delete canvas.dataset.ready;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
