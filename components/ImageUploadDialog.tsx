import { useRef, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  ImageIcon, 
  Upload, 
  X, 
  Loader2 
} from "lucide-react";

interface BusinessData {
  name: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  founded: string;
  services: string;
  otherServices: string;
  size: string;
  serviceArea: string;
  description: string;
  contractorType: string;
  logo?: string;
  images?: string[];
}

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: BusinessData | null;
  onLogoUpload: (file: File) => void;
  onImagesUpload: (files: File[]) => void;
  onRemoveLogo: () => void;
  onRemoveImage: (imageUrl: string) => void;
  uploading: boolean;
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  business,
  onLogoUpload,
  onImagesUpload,
  onRemoveLogo,
  onRemoveImage,
  uploading
}: ImageUploadDialogProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onLogoUpload(file);
    }
  };

  const handleImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      onImagesUpload(imageFiles);
    }
  };

  if (!business) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {business.logo ? (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                <Image 
                  src={business.logo} 
                  alt={`${business.name} logo`}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <Building2 className="h-8 w-8 text-blue-600" />
            )}
            {business.name}
          </DialogTitle>
          <DialogDescription>
            Manage logo and images for this business
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="logo" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logo" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Logo
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images ({business.images?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Logo Tab */}
          <TabsContent value="logo" className="space-y-4">
            <div className="text-center space-y-4">
              {business.logo ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-slate-200 mx-auto">
                      <Image 
                        src={business.logo} 
                        alt="Business logo"
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                      onClick={onRemoveLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploading}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Replace Logo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto border-2 border-dashed border-slate-300">
                    <Building2 className="h-12 w-12 text-slate-400" />
                  </div>
                  <Button
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploading}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload Logo
                  </Button>
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Business Images</h3>
                <Button
                  onClick={() => imagesInputRef.current?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Add Images
                </Button>
              </div>

              {business.images && business.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {business.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-24 rounded-lg overflow-hidden border-2 border-slate-200">
                        <Image
                          src={image}
                          alt={`Business image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemoveImage(image)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto border-2 border-dashed border-slate-300">
                    <ImageIcon className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-slate-600 mb-2">No images uploaded yet</p>
                    <p className="text-sm text-slate-500">Add photos to showcase this business</p>
                  </div>
                </div>
              )}

              <input
                ref={imagesInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesUpload}
                className="hidden"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}