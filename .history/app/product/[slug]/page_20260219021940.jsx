import ProductDetails from '@/components/product/ProductDetails';
import React from 'react';

const page = ({params}) => {
    return (
        <div>
            <ProductDetails slug={params.slug}/>
        </div>
    );
};

export default page;