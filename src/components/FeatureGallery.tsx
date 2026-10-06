"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { features } from "@/lib/site";
import Icon from "./Icon";
export function FeatureArtwork({ image, alt, title }: { image: string; alt: string; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <><button className="artwork-button" onClick={() => dialog.current?.showModal()} aria-label={`Enlarge ${title} graphic`}><Image src={image} alt={alt} width={1122} height={1402} sizes="(max-width: 800px) 100vw, 45vw" /><span>Explore the graphic <Icon name="arrowUp" size={16} /></span></button><dialog className="artwork-dialog" ref={dialog} onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}><button className="dialog-close" aria-label="Close graphic" onClick={() => dialog.current?.close()}><Icon name="close" /></button><Image src={image} alt={alt} width={1122} height={1402} sizes="90vw" /><p>{title}</p></dialog></>;
}
export default function FeatureGallery() {
  const [selected, setSelected] = useState(0);
  const feature = features[selected];
  return <section className="feature-explorer container" id="explore"><header className="section-heading"><div><span className="eyebrow">Built around your workday</span><h2>Good days start<br />with a clearer picture.</h2></div><p>From the first check-in to month-end review, keep the everyday pieces of HR connected.</p></header><div className="feature-selector" aria-label="Explore HR features">{features.map((item, index) => <button key={item.id} aria-pressed={selected === index} onClick={() => setSelected(index)}><span>{item.number}</span>{item.shortTitle}</button>)}</div><div className="feature-stage"><div className="feature-stage-copy"><span className="feature-count">{feature.number} / 05</span><h3>{feature.title}</h3><p>{feature.description}</p><ul className="check-list">{feature.points.map((point) => <li key={point}><Icon name="check" size={17} />{point}</li>)}</ul><Link href={`/services#${feature.id}`} className="text-link">Explore {feature.shortTitle.toLowerCase()} <Icon name="arrow" size={19} /></Link></div><div className="feature-stage-art"><FeatureArtwork image={feature.image} alt={feature.alt} title={feature.shortTitle} /></div></div></section>;
}
