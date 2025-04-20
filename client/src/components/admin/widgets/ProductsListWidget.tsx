import React from 'react';
import Widget, { WidgetProps } from './Widget';
import { Package } from 'lucide-react';
import { useAdminProducts } from '@/hooks/admin';

interface ProductsListWidgetProps extends Omit<WidgetProps, 'children' | 'icon'> {
  limit?: number;
}

const ProductsListWidget: React.FC<ProductsListWidgetProps> = ({
  limit = 5,
  ...rest
}) => {
  const { query } = useAdminProducts(1, limit);
  const { data, isLoading, error } = query;

  return (
    <Widget {...rest} icon={<Package className="h-4 w-4" />}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading products...</p>
      ) : error ? (
        <p className="text-sm text-destructive">Error loading products</p>
      ) : !data?.products?.length ? (
        <p className="text-sm text-muted-foreground">No products found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left font-medium p-2 text-xs">Product</th>
                <th className="text-left font-medium p-2 text-xs">SKU</th>
                <th className="text-right font-medium p-2 text-xs">Price</th>
                <th className="text-right font-medium p-2 text-xs">Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.products.slice(0, limit).map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="p-2 text-xs">
                    <div className="flex items-center gap-2">
                      {product.imageUrl && (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                      <span className="truncate max-w-[150px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-2 text-xs text-muted-foreground">{product.sku || '-'}</td>
                  <td className="p-2 text-right text-xs">₹{product.price.toFixed(2)}</td>
                  <td className="p-2 text-right text-xs">
                    <span 
                      className={`font-medium ${
                        product.stock > 10 ? 'text-green-600' : 
                        product.stock > 0 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Widget>
  );
};

export default ProductsListWidget;