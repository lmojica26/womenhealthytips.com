"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Link2,
  ExternalLink,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  shortCode: string;
  network: string;
  productId: string | null;
  commission: number | null;
  description: string | null;
  imageUrl: string | null;
  callToAction: string | null;
  showInSidebar: boolean;
  sidebarOrder: number;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
}

const networks = [
  { value: "CLICKBANK", label: "ClickBank" },
  { value: "AMAZON", label: "Amazon" },
  { value: "SHAREASALE", label: "ShareASale" },
  { value: "CJ_AFFILIATE", label: "CJ Affiliate" },
  { value: "IMPACT", label: "Impact" },
  { value: "OTHER", label: "Other" },
];

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] =
    useState<AffiliateLink | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    shortCode: "",
    network: "CLICKBANK",
    productId: "",
    commission: "",
    description: "",
    imageUrl: "",
    callToAction: "Shop Now",
    showInSidebar: true,
    sidebarOrder: 0,
    isActive: true,
  });

  const fetchAffiliates = async () => {
    try {
      const res = await fetch("/api/affiliates");
      const data = await res.json();
      setAffiliates(data);
    } catch (error) {
      console.error("Error fetching affiliates:", error);
      toast.error("Failed to load affiliates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      shortCode: "",
      network: "CLICKBANK",
      productId: "",
      commission: "",
      description: "",
      imageUrl: "",
      callToAction: "Shop Now",
      showInSidebar: true,
      sidebarOrder: 0,
      isActive: true,
    });
    setSelectedAffiliate(null);
  };

  const openEditDialog = (affiliate: AffiliateLink) => {
    setSelectedAffiliate(affiliate);
    setFormData({
      name: affiliate.name,
      url: affiliate.url,
      shortCode: affiliate.shortCode,
      network: affiliate.network,
      productId: affiliate.productId || "",
      commission: affiliate.commission?.toString() || "",
      description: affiliate.description || "",
      imageUrl: affiliate.imageUrl || "",
      callToAction: affiliate.callToAction || "Shop Now",
      showInSidebar: affiliate.showInSidebar,
      sidebarOrder: affiliate.sidebarOrder,
      isActive: affiliate.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.url) {
      toast.error("Name and URL are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        commission: formData.commission ? parseFloat(formData.commission) : null,
        productId: formData.productId || null,
        description: formData.description || null,
        imageUrl: formData.imageUrl || null,
      };

      const url = selectedAffiliate
        ? `/api/affiliates/${selectedAffiliate.id}`
        : "/api/affiliates";
      const method = selectedAffiliate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      toast.success(
        selectedAffiliate ? "Affiliate updated!" : "Affiliate created!"
      );
      setDialogOpen(false);
      resetForm();
      fetchAffiliates();
    } catch (error) {
      console.error("Error saving affiliate:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save affiliate"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAffiliate) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/affiliates/${selectedAffiliate.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Affiliate deleted!");
      setDeleteDialogOpen(false);
      setSelectedAffiliate(null);
      fetchAffiliates();
    } catch (error) {
      console.error("Error deleting affiliate:", error);
      toast.error("Failed to delete affiliate");
    } finally {
      setSaving(false);
    }
  };

  const totalClicks = affiliates.reduce((sum, a) => sum + a.clickCount, 0);
  const sidebarCount = affiliates.filter((a) => a.showInSidebar).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-poppins">Affiliate Links</h1>
          <p className="text-muted-foreground">
            Manage your affiliate links and track performance
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Affiliate Link
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Sidebar</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sidebarCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Sidebar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[50px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[50px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[60px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[30px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : affiliates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No affiliate links yet</p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      resetForm();
                      setDialogOpen(true);
                    }}
                  >
                    Add your first link
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              affiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{affiliate.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {affiliate.url}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {networks.find((n) => n.value === affiliate.network)
                        ?.label || affiliate.network}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                      {affiliate.clickCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    {affiliate.showInSidebar ? (
                      <Badge className="bg-green-500">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {affiliate.isActive ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(affiliate)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(affiliate.url, "_blank")
                          }
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedAffiliate(affiliate);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAffiliate ? "Edit Affiliate Link" : "Add Affiliate Link"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label htmlFor="network">Network</Label>
                <Select
                  value={formData.network}
                  onValueChange={(value) =>
                    setFormData({ ...formData, network: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.value} value={network.value}>
                        {network.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="url">Affiliate URL *</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shortCode">Short Code</Label>
                <Input
                  id="shortCode"
                  value={formData.shortCode}
                  onChange={(e) =>
                    setFormData({ ...formData, shortCode: e.target.value })
                  }
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div>
                <Label htmlFor="commission">Commission %</Label>
                <Input
                  id="commission"
                  type="number"
                  value={formData.commission}
                  onChange={(e) =>
                    setFormData({ ...formData, commission: e.target.value })
                  }
                  placeholder="50"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the product"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="callToAction">Button Text</Label>
                <Input
                  id="callToAction"
                  value={formData.callToAction}
                  onChange={(e) =>
                    setFormData({ ...formData, callToAction: e.target.value })
                  }
                  placeholder="Shop Now"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.showInSidebar}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, showInSidebar: checked })
                  }
                />
                <Label>Show in Sidebar</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Affiliate Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedAffiliate?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
