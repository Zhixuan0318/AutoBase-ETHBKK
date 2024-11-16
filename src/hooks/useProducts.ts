import { useCallback, useEffect, useRef, useState } from 'react';

import Database from '@/services/Database';

import productsData from '@/data/productsData';

const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const database = useRef(new Database());

    const handleProductsLoad = useCallback(async () => {
        const prods: Product[] = [];
        const stocks = await database.current.getAllOffChainStocks();
        for (let prod of productsData) {
            prod.stock = stocks[prod.id].stock;
            prods.push(prod);
        }
        setProducts(prods);
    }, [products]);

    useEffect(() => {
        if (!products.length) handleProductsLoad();
        else setTimeout(() => handleProductsLoad(), 10_000);
    }, [products]);

    const updateProductStock = useCallback(
        (id: number, stock: number) => {
            const copy = products.map((prod) => {
                if (prod.id == id) prod.stock += stock;
                return prod;
            });
            setProducts(copy);
        },
        [products]
    );

    return { products, updateProductStock };
};

export default useProducts;
