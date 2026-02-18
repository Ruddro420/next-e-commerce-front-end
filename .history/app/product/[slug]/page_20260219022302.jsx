import ProductDetails from '@/components/product/ProductDetails';
import RelatedProduct from '@/components/product/RelatedProduct';
import React from 'react';

const page = ({params}) => {
    return (
        <div>
            <ProductDetails slug={params.slug}/>
            <RelatedProduct/>
        </div>
    );
};

export default page;