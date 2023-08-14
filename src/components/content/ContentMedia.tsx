'use client'
import path from 'path';

import SummaryImage from './SummaryImage';
import InConstruction from '../Shared/InConstruction';
import DynamicComponent from '../dynamic/_Loader';
interface ContentMediaProps {
    data: any
}
export default function ContentMedia({ data }: ContentMediaProps) {
    if (data.type == 'image') {
        return (
            <SummaryImage src={data.src} alt={data.alt} />
        )
    }
    else if (data.type == 'component') {
        return <DynamicComponent component={data.component} properties={data.properties} />
    }
    return (
        <InConstruction />
    )
}