"use client";

import { useState, useEffect } from "react";
import { getTables, createTable, clearTable, deleteTable } from "@/src/service/manager.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Plus, Trash2, QrCode } from "lucide-react";

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchTables();

    const handleUpdate = () => {
      fetchTables();
    };

    window.addEventListener("socketUpdate", handleUpdate);
    return () => {
      window.removeEventListener("socketUpdate", handleUpdate);
    };
  }, []);

  const fetchTables = async () => {
    try {
      const data = await getTables();
      if (data.success) {
        setTables(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tables", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await createTable({ tableNumber });
      setTableNumber("");
      setIsAdding(false);
      fetchTables();
    } catch (error) {
      console.error("Failed to add table", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClearTable = async (tableId) => {
    if (!window.confirm("Are you sure you want to clear this table? This will mark active orders for this table as accepted.")) return;
    try {
      await clearTable(tableId);
      fetchTables();
    } catch (error) {
      console.error("Failed to clear table", error);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY DELETE this table? This cannot be undone.")) return;
    try {
      await deleteTable(tableId);
      fetchTables();
    } catch (error) {
      console.error("Failed to delete table", error);
      alert(error.response?.data?.message || "Failed to delete table. Please make sure there are no active orders.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-crema-50">Tables &amp; QR codes</h1>
          <p className="text-crema-100/50 mt-1 text-sm">Generate a scannable code for every table.</p>
        </div>
        {!isAdding && (
          <Button className="gap-2" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" />
            Add table
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="ring-1 ring-primary-500/30 max-w-md">
          <CardContent className="pt-6">
            <form onSubmit={handleAddTable} className="space-y-4">
              <Input
                label="Table number or name"
                id="tableNumber"
                placeholder="e.g. 5 or Window-1"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                required
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitLoading}>
                  {submitLoading ? "Adding..." : "Add table"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="animate-pulse text-crema-100/50 font-mono text-sm">Loading tables&hellip;</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tables.map((table) => (
            <Card key={table._id} className="flex flex-col text-center">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-mono">Table {table.tableNumber}</CardTitle>
                <div className="flex justify-center gap-2 mt-2">
                  {table.waiterRequested && (
                    <span className="bg-cherry-500/10 text-cherry-600 text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wide">Waiter called</span>
                  )}
                  {table.billRequested && (
                    <span className="bg-primary-500/10 text-primary-700 text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wide">Bill requested</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col items-center flex-1">
                {table.qrCode ? (
                  <div className="p-2 border border-espresso-900/10 rounded-lg bg-crema-50 mb-4">
                    <img src={table.qrCode} alt={`QR Code for Table ${table.tableNumber}`} className="w-28 h-28" />
                  </div>
                ) : (
                  <div className="w-28 h-28 border border-dashed border-espresso-900/20 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-7 h-7 text-espresso-900/25" />
                  </div>
                )}

                <div className="mt-auto pt-4 w-full border-t border-espresso-900/10 flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = table.qrCode;
                      link.download = `Table-${table.tableNumber}-QR.png`;
                      link.click();
                    }}
                  >
                    Download QR
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      className="w-full text-xs"
                      onClick={() => handleClearTable(table._id)}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="danger"
                      className="w-full text-xs"
                      onClick={() => handleDeleteTable(table._id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {tables.length === 0 && !isAdding && (
            <div className="col-span-full py-12 text-center text-crema-100/40 border border-dashed border-crema-50/15 rounded-xl">
              No tables yet. Add your first table to get a QR code.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
