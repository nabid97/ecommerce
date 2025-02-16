import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card/Card';
import { fabricApi } from '../api';

const ProductGallery = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    color: '',
    minPrice: '',
    maxPrice: '',
    sort: 'price-asc'
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fabricApi.getFabrics(filters);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductClick = (productId) => {
    navigate(`/fabric/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="border rounded p-2"
        >
          <option value="">All Types</option>
          <option value="cotton">Cotton</option>
          <option value="polyester">Polyester</option>
          <option value="silk">Silk</option>
          <option value="linen">Linen</option>
        </select>

        <select
          name="color"
          value={filters.color}
          onChange={handleFilterChange}
          className="border rounded p-2"
        >
          <option value="">All Colors</option>
          <option value="white">White</option>
          <option value="black">Black</option>
          <option value="navy">Navy</option>
          <option value="red">Red</option>
        </select>

        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleFilterChange}
          className="border rounded p-2"
        />

        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          className="border rounded p-2"
        />

        <select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
          className="border rounded p-2"
        >
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card 
            key={product.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleProductClick(product.id)}
          >
            <CardContent>
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
                <img
                  src={product.images[0]?.url || '/placeholder.png'}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{product.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-lg font-bold">${product.price}</span>
                <span className="text-sm text-gray-500">
                  Min. Order: {product.minOrderQuantity}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <div
                    key={color.code}
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: color.code }}
                    title={color.name}
                  ></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No products found</h3>
          <p className="text-gray-600 mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;