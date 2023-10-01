'use client'

import SummaryImage from './SummaryImage';
import InConstruction from '../Shared/InConstruction';
import _Loader from '../Shared/_Loader';
interface ContentMediaProps {
    data: any
}
export default function ContentMedia({ data }: ContentMediaProps) {
    if(!data){
        return (
            <InConstruction />
        )
    }
    if (data.type == 'image') {
        return (
            <SummaryImage src={data.src} alt={data.alt} />
        )
    }
    else if (data.type == 'component') {
        return <_Loader component={data.component} properties={data.properties} />
    }
    return (
        <InConstruction />
    )
}