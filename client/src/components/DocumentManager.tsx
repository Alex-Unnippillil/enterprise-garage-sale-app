"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Trash2, 
  Plus,
  Search,
  Filter,
  Lock,
  Globe
} from "lucide-react";
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

interface DocumentManagerProps {
  propertyId?: number;
  title?: string;
  description?: string;
  showUploadButton?: boolean;
  showSearch?: boolean;
  maxHeight?: string;
  onDocumentSelect?: (document: Document) => void;
  selectedDocumentId?: number;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
  propertyId,
  title = "Documents",
  description = "Manage and organize documents",
  showUploadButton = true,
  showSearch = true,
  maxHeight = "400px",
  onDocumentSelect,
  selectedDocumentId
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchDocuments();
  }, [propertyId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/documents");
      const data = await response.json();
      
      // Filter by property if propertyId is provided
      let filteredDocs = data.documents || [];
      if (propertyId) {
        filteredDocs = filteredDocs.filter((doc: Document) => 
          doc.propertyId === propertyId || doc.isPublic
        );
      }
      
      setDocuments(filteredDocs);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (formData: FormData) => {
    try {
      if (propertyId) {
        formData.append("propertyId", propertyId.toString());
      }
      
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setShowUploadDialog(false);
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
        return <FileText className="w-5 h-5 text-red-500" />;
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Image className="w-5 h-5 text-green-500" />;
      case "document":
      case "doc":
      case "docx":
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
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
    return matchesSearch && matchesCategory;
  });

  const categories = ["Lease Agreement", "Maintenance", "Property Photos", "Financial", "Legal", "Other"];

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              {title}
            </CardTitle>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          {showUploadButton && (
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload
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
                  propertyId={propertyId}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showSearch && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {filteredDocuments.length} documents
              </span>
            </div>
          </div>
        )}

        <ScrollArea style={{ maxHeight }}>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No documents found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDocumentId === document.id
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onDocumentSelect?.(document)}
                >
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
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{document.name}</h4>
                      {getCategoryBadge(document.category)}
                    </div>
                    {document.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {document.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                      <span>{formatFileSize(document.fileSize)}</span>
                      <span>{format(new Date(document.uploadedAt), "MMM d, yyyy")}</span>
                      <span>{document.uploadedBy}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/api/documents/${document.id}/download`, '_blank');
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(document.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface DocumentUploadFormProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  categories: string[];
  propertyId?: number;
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onSubmit,
  onCancel,
  categories,
  propertyId,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    type: "",
    isPublic: false,
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
    if (propertyId) {
      formDataToSend.append("propertyId", propertyId.toString());
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

      <div>
        <Label htmlFor="type">Document Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PDF">PDF</SelectItem>
            <SelectItem value="Image">Image</SelectItem>
            <SelectItem value="Document">Document</SelectItem>
            <SelectItem value="Spreadsheet">Spreadsheet</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
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

export default DocumentManager; 