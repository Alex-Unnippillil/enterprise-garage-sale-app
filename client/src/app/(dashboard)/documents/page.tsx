"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FolderOpen, 
  FileText, 
  Image, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Building,
  Lock,
  Globe
} from "lucide-react";
import { useGetAuthUserQuery } from "@/state/api";
import { format } from "date-fns";

interface Document {
  id: number;
  name: string;
  description?: string;
  type: string;
  category: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  isPublic: boolean;
  propertyId?: number;
  propertyName?: string;
  downloadUrl: string;
  previewUrl?: string;
}

const DocumentsPage: React.FC = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    category: "",
    type: "",
    isPublic: false,
    propertyId: "",
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/documents");
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (formData: FormData) => {
    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setShowUploadDialog(false);
        setUploadForm({
          name: "",
          description: "",
          category: "",
          type: "",
          isPublic: false,
          propertyId: "",
        });
        fetchDocuments();
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      fetchDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="w-6 h-6 text-red-500" />;
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Image className="w-6 h-6 text-green-500" />;
      case "document":
      case "doc":
      case "docx":
        return <FileText className="w-6 h-6 text-blue-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      "Lease Agreement": "bg-blue-100 text-blue-800",
      "Maintenance": "bg-orange-100 text-orange-800",
      "Property Photos": "bg-green-100 text-green-800",
      "Financial": "bg-purple-100 text-purple-800",
      "Legal": "bg-red-100 text-red-800",
      "Other": "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[category as keyof typeof colors] || colors.Other}>{category}</Badge>;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesType = selectedType === "all" || doc.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = ["Lease Agreement", "Maintenance", "Property Photos", "Financial", "Legal", "Other"];
  const types = ["PDF", "Image", "Document", "Spreadsheet", "Other"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-gray-600">Manage and organize your property documents</p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <DocumentUploadForm
              onSubmit={handleUpload}
              onCancel={() => setShowUploadDialog(false)}
              categories={categories}
              types={types}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {filteredDocuments.length} of {documents.length} documents
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No documents found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDelete={handleDelete}
                  getFileIcon={getFileIcon}
                  getCategoryBadge={getCategoryBadge}
                  formatFileSize={formatFileSize}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list">
          <DocumentList
            documents={filteredDocuments}
            onDelete={handleDelete}
            getFileIcon={getFileIcon}
            getCategoryBadge={getCategoryBadge}
            formatFileSize={formatFileSize}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface DocumentCardProps {
  document: Document;
  onDelete: (id: number) => void;
  getFileIcon: (type: string) => React.ReactNode;
  getCategoryBadge: (category: string) => React.ReactNode;
  formatFileSize: (bytes: number) => string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDelete,
  getFileIcon,
  getCategoryBadge,
  formatFileSize,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getFileIcon(document.type)}
            <div className="flex items-center gap-1">
              {document.isPublic ? (
                <Globe className="w-4 h-4 text-green-500" />
              ) : (
                <Lock className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(document.downloadUrl, '_blank')}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(document.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-sm truncate">{document.name}</h3>
            {document.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {document.description}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            {getCategoryBadge(document.category)}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatFileSize(document.fileSize)}</span>
              <span>{format(new Date(document.uploadedAt), "MMM d, yyyy")}</span>
            </div>
          </div>

          {document.propertyName && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Building className="w-3 h-3" />
              <span>{document.propertyName}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <User className="w-3 h-3" />
            <span>{document.uploadedBy}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: number) => void;
  getFileIcon: (type: string) => React.ReactNode;
  getCategoryBadge: (category: string) => React.ReactNode;
  formatFileSize: (bytes: number) => string;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDelete,
  getFileIcon,
  getCategoryBadge,
  formatFileSize,
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b last:border-b-0"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(document.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{document.name}</h3>
                      {document.isPublic ? (
                        <Globe className="w-4 h-4 text-green-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    {document.description && (
                      <p className="text-sm text-gray-500 truncate">
                        {document.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {getCategoryBadge(document.category)}
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>{format(new Date(document.uploadedAt), "MMM d, yyyy")}</span>
                  <span>{document.uploadedBy}</span>
                  {document.propertyName && (
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {document.propertyName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(document.downloadUrl, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(document.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface DocumentUploadFormProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  categories: string[];
  types: string[];
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onSubmit,
  onCancel,
  categories,
  types,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    type: "",
    isPublic: false,
    propertyId: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formDataToSend = new FormData();
    formDataToSend.append("file", selectedFile);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("type", formData.type);
    formDataToSend.append("isPublic", formData.isPublic.toString());
    if (formData.propertyId) {
      formDataToSend.append("propertyId", formData.propertyId);
    }

    onSubmit(formDataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Document Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description of the document"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Document Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {types.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="propertyId">Property (Optional)</Label>
          <Input
            id="propertyId"
            value={formData.propertyId}
            onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
            placeholder="Property ID"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="file">Select File</Label>
        <div className="mt-2">
          <Input
            id="file"
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={formData.isPublic}
          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
        />
        <Label htmlFor="isPublic">Make document public</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedFile}>
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>
    </form>
  );
};

export default DocumentsPage; 