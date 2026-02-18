import ProductDetails from '@/components/product/ProductDetails';
import RelatedProduct from '@/components/product/RelatedProduct';
import Container from '@/components/ui/Container';
import React from 'react';

const page = ({ params }) => {
    return (
        <div>
            <ProductDetails slug={params.slug} />
            <Container className="space-y-10">
                <RelatedProduct />
            </Container>
            <RelatedProduct />
        </div>
    );
};

export default page;