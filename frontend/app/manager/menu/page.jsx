"use client";

import { useState, useEffect } from "react";
import { getMenuItems, createMenuItem } from "@/src/service/manager.service";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { UtensilsCrossed, Plus, Tag } from "lucide-react";

const selectClass = "block w-full rounded-md border border-espresso-900/15 bg-crema-50 text-espresso-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
const labelClass = "block text-xs font-semibold uppercase tracking-wide text-espresso-900/60 mb-1.5";

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", price: "", isVeg: true, category: "Starters" });
  const [file, setFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await getMenuItems();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch menu items", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("isVeg", formData.isVeg);
      data.append("category", formData.category);
      if (file) {
        data.append("image", file);
      }

      await createMenuItem(data);
      setIsAdding(false);
      setFormData({ name: "", description: "", price: "", isVeg: true, category: "Starters" });
      setFile(null);
      fetchItems(); // Refresh list
    } catch (error) {
      console.error("Failed to create menu item", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-crema-50">Menu</h1>
          <p className="text-crema-100/50 mt-1 text-sm">Add and manage what's on offer.</p>
        </div>
        {!isAdding && (
          <Button className="gap-2" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" />
            Add item
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="ring-1 ring-primary-500/30">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Item name"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Price (₹)"
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <div className="md:col-span-2">
                  <Input
                    label="Description"
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    className={selectClass}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Breads">Breads</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Item type</label>
                  <select
                    className={selectClass}
                    value={formData.isVeg ? "veg" : "non-veg"}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === "veg" })}
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="block w-full text-sm text-espresso-900/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500/15 file:text-primary-700 hover:file:bg-primary-500/25"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-espresso-900/10 mt-6">
                <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitLoading}>
                  {submitLoading ? "Adding..." : "Save item"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="animate-pulse text-crema-100/50 font-mono text-sm">Loading menu items&hellip;</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <Card key={item._id} className="flex flex-col group">
              <div className="relative h-40 bg-espresso-900/5 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-espresso-900/20">
                    <UtensilsCrossed className="w-10 h-10" />
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide ${item.isVeg ? "bg-leaf-500/90 text-crema-50" : "bg-cherry-500/90 text-crema-50"}`}>
                  {item.isVeg ? "VEG" : "NON-VEG"}
                </div>
              </div>
              <CardContent className="flex-1 flex flex-col pt-4">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-espresso-900 leading-tight">{item.name}</h3>
                  <span className="font-mono font-semibold text-primary-600 shrink-0">&#8377;{item.price}</span>
                </div>
                <p className="text-sm text-espresso-900/50 flex-1">{item.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-espresso-900/50 font-medium bg-espresso-900/5 px-2 py-1 rounded">{item.category}</span>
                  <span className={`flex items-center gap-1 font-medium ${item.isAvailable ? "text-leaf-600" : "text-cherry-600"}`}>
                    <Tag className="w-3 h-3" /> {item.isAvailable ? "Available" : "Out of stock"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && !isAdding && (
            <div className="col-span-full py-12 text-center text-crema-100/40 border border-dashed border-crema-50/15 rounded-xl">
              No menu items yet. Click "Add item" to start building your menu.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
