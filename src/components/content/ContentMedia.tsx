'use client'
import path from 'path';

import SummaryImage from './SummaryImage';
import InConstruction from '../InConstruction';
import DynamicComponent from '../DynamicComponent';
interface ContentMediaProps {
    src: string;
    alt: string;
}
export default function ContentMedia({ src, alt }: ContentMediaProps) {
    const ext = path.extname(src);
    if (ext == '.png') {
        return (
            <SummaryImage src={src} alt={alt} />
        )
    }
    else if (ext == '.tsx') {
        return <DynamicComponent component={src.replace('.tsx', '')} properties={alt.split(" ")} />
    }
    return (
        <InConstruction />
    )
}