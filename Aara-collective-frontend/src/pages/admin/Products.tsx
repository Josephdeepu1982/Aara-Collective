import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Eye, Edit } from "lucide-react";

type Product = {
  id: string;
  name: string;
  basePriceCents: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
};

type Props = {};

const ProductsPage = (props: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState<string>("");
  const [newProductPrice, setNewProductPrice] = useState<string>("");
  const [newProductDescription, setNewProductDescription] =
    useState<string>("");
  const [newProductCategory, setNewProductCategory] = useState<string>("");
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  //Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      console.log("Products API response:", data);
      setProducts(data.items);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  //add a new product ((JSON now, to be uploaded to S3 later))
  const handleAddProduct = async () => {
    try {
      let imageUrl = "/placeholder.png";
      if (newProductImage) {
        imageUrl = `/uploads/${newProductImage.name}`;
      }

      const cents = Math.round(Number(newProductPrice) * 100);

      const newProduct = {
        name: newProductName,
        basePriceCents: cents,
        description: newProductDescription,
        categoryId: newProductCategory,
        isActive: true,
        isSale: false,
        isNew: false,
        isBestSeller: false,
        images: [{ url: imageUrl, alt: newProductName }],
        variants: [
          {
            sku: `SKU-${Date.now()}`,
            name: "Default",
            priceCents: cents,
            stock: 0,
          },
        ],
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to add product");
      }
      const created = await response.json();
      setProducts((previousProducts) => [...previousProducts, created]);

      //Reset form
      setNewProductName("");
      setNewProductPrice("");
      setNewProductDescription("");
      setNewProductCategory("");
      setNewProductImage(null);
    } catch (error) {
      console.error("Error adding Product", error);
      setError("Could not add product");
    }
  };

  //Delete a product
  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((previousProducts) =>
        previousProducts.filter((p) => p.id !== productId),
      );
    } catch (error: any) {
      console.error("Error deleting product:", error);
      setError("Could not delete product.");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  //Run fetchProducts once when page loads
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  if (loading) {
    return <p className="p-6">Loading products...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>

        {/* Add Prodcust Modal */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Name */}
              <Input
                placeholder="Product Name"
                value={newProductName}
                onChange={(event) => setNewProductName(event.target.value)}
              />

              {/* Price */}
              <Input
                type="number"
                placeholder="Price in SGD"
                value={newProductPrice}
                onChange={(event) => setNewProductPrice(event.target.value)}
              />

              {/* Description */}
              <Textarea
                placeholder="Product Description"
                value={newProductDescription}
                onChange={(event) =>
                  setNewProductDescription(event.target.value)
                }
              />

              {/* Category Select */}
              <Select onValueChange={(value) => setNewProductCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Image Upload Preview */}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewProductImage(e.target.files?.[0] || null)
                }
              />
              {newProductImage && (
                <img
                  src={URL.createObjectURL(newProductImage)}
                  alt="preview"
                  className="h-20 mt-2 rounded"
                />
              )}

              {/* Save Button */}
              <Button
                onClick={handleAddProduct}
                className="bg-pink-600 text-white"
              >
                Save Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                $
                {product.basePriceCents
                  ? (product.basePriceCents / 100).toFixed(2)
                  : "0.00"}
              </TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                {product.isActive ? (
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                    Inactive
                  </span>
                )}
              </TableCell>
              <TableCell>
                {new Date(product.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex space-x-2">
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsPage;
