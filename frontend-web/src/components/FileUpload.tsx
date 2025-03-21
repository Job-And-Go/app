import { useState, useCallback } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { supabase } from "@/lib/supabase";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  existingUrl?: string;
  type: 'cv' | 'avatar';
  userId: string;
}

export default function FileUpload({ onUploadComplete, existingUrl, type, userId }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(existingUrl || '');

  const acceptedFiles: Accept = type === 'cv' 
    ? { 'application/pdf': ['.pdf'] }
    : { 'image/*': ['.jpeg', '.jpg', '.png'] } as Accept;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (type === 'cv' && file.type !== 'application/pdf') {
      alert('Veuillez télécharger un fichier PDF pour votre CV');
      return;
    }

    if (type === 'avatar' && !file.type.startsWith('image/')) {
      alert('Veuillez télécharger une image pour votre photo de profil');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${type}.${fileExt}`;
      const bucketName = type === 'cv' ? 'cvs' : 'avatars';

      // Supprimer l'ancien fichier s'il existe
      if (existingUrl) {
        const oldPath = existingUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from(bucketName)
            .remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert(`Erreur lors du téléchargement du ${type === 'cv' ? 'CV' : 'photo de profil'}`);
    } finally {
      setUploading(false);
    }
  }, [type, userId, existingUrl, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFiles,
    maxFiles: 1,
    maxSize: type === 'cv' ? 5000000 : 2000000
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-theme-primary bg-theme-light' : 'border-gray-300 hover:border-theme-primary'}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-gray-600">Téléchargement en cours...</p>
        ) : (
          <p className="text-gray-600">
            {isDragActive
              ? "Déposez le fichier ici"
              : type === 'cv' 
                ? "Glissez-déposez votre CV (PDF) ici, ou cliquez pour sélectionner"
                : "Glissez-déposez votre photo de profil ici, ou cliquez pour sélectionner"}
          </p>
        )}
      </div>

      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
          {type === 'avatar' ? (
            <img
              src={previewUrl}
              alt="Photo de profil"
              className="w-32 h-32 rounded-full object-cover shadow"
            />
          ) : (
            <a 
              href={previewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Voir le CV
            </a>
          )}
        </div>
      )}
    </div>
  );
} 