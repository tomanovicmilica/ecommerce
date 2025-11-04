import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import type { Product, Category, ProductVariant, ProductType } from '../../../app/models/product';
import agent from '../../../app/api/agent';

interface AttributeValue {
    id: number;
    value: string;
    attributeId: number;
}

interface Attribute {
    id: number;
    name: string;
    type: string;
    values: AttributeValue[];
}

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0.01, 'Price must be greater than 0'),
    categoryId: z.number().min(1, 'Category is required'),
    productType: z.number(),
    digitalFileUrl: z.string().optional(),
    isInstantDelivery: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Props {
    product?: Product;
    onSubmit: (data: ProductFormData & { images: File[], variants: ProductVariant[], digitalFile: File | null }) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function ProductForm({ product, onSubmit, onCancel, loading = false }: Props) {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [digitalFile, setDigitalFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: product ? {
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId || 0,
            productType: product.productType || 0,
            digitalFileUrl: product.digitalFileUrl || '',
            isInstantDelivery: product.isInstantDelivery || false,
        } : {
            name: '',
            description: '',
            price: 0,
            categoryId: 0,
            productType: 0,
            digitalFileUrl: '',
            isInstantDelivery: false,
        }
    });

    // Watch product type to show/hide digital fields
    const selectedProductType = watch('productType');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await agent.Admin.getCategories();
                console.log('Categories loaded:', response);
                setCategories(response);

                // If editing a product and categoryId is valid, ensure it's set
                if (product && product.categoryId) {
                    setValue('categoryId', product.categoryId);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        const fetchAttributes = async () => {
            try {
                const response = await agent.Admin.getAttributes();
                setAttributes(response);
            } catch (error) {
                console.error('Failed to fetch attributes:', error);
            }
        };

        fetchCategories();
        fetchAttributes();

        // Set existing variants if editing
        if (product?.variants) {
            setVariants(product.variants);
        }
    }, [product, setValue]);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setSelectedImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDigitalFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setDigitalFile(file);
            // Optionally upload to Cloudinary immediately and get URL
            // For now, we'll just store the file
        }
    };

    const removeDigitalFile = () => {
        setDigitalFile(null);
    };

    const addVariant = () => {
        const newVariant: ProductVariant = {
            productVariantId: 0, // Will be set by backend
            productId: product?.productId || 0,
            price: watch('price'), // Use base product price
            quantityInStock: 0,
            attributeValueIds: [],
            attributes: []
        };
        setVariants(prev => [...prev, newVariant]);
    };

    const removeVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
        setVariants(prev => prev.map((variant, i) =>
            i === index ? { ...variant, [field]: value } : variant
        ));
    };

    const updateVariantAttributeValues = (variantIndex: number, attributeValueIds: number[]) => {
        setVariants(prev => prev.map((variant, i) => {
            if (i === variantIndex) {
                // Update the attributeValueIds array
                const updatedVariant = { ...variant, attributeValueIds };

                // Also update the attributes array for display purposes
                const attributeDetails = attributeValueIds.map(valueId => {
                    const attribute = attributes.find(attr =>
                        attr.values.some(val => val.id === valueId)
                    );
                    const value = attribute?.values.find(val => val.id === valueId);
                    return {
                        attributeName: attribute?.name || '',
                        attributeValue: value?.value || ''
                    };
                }).filter(attr => attr.attributeName && attr.attributeValue);

                updatedVariant.attributes = attributeDetails;
                return updatedVariant;
            }
            return variant;
        }));
    };

    const isAttributeValueSelected = (variantIndex: number, valueId: number): boolean => {
        return variants[variantIndex]?.attributeValueIds.includes(valueId) || false;
    };

    const toggleAttributeValue = (variantIndex: number, attributeId: number, valueId: number) => {
        const variant = variants[variantIndex];
        const currentValues = variant.attributeValueIds || [];

        // Remove any other values from the same attribute (since each attribute should have only one value per variant)
        const attribute = attributes.find(attr => attr.id === attributeId);
        const otherValuesFromSameAttribute = attribute?.values
            .filter(val => val.id !== valueId)
            .map(val => val.id) || [];

        const filteredValues = currentValues.filter(id => !otherValuesFromSameAttribute.includes(id));

        // Toggle the selected value
        const newValues = filteredValues.includes(valueId)
            ? filteredValues.filter(id => id !== valueId)
            : [...filteredValues, valueId];

        updateVariantAttributeValues(variantIndex, newValues);
    };

    const onFormSubmit = (data: ProductFormData) => {
        onSubmit({ ...data, images: selectedImages, variants, digitalFile });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button
                        onClick={onCancel}
                        className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {product ? 'Ažuriraj proizvod' : 'Dodaj novi proizvod'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Osnovne informacije</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Naziv proizvoda *
                            </label>
                            <input
                                {...register('name')}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                placeholder="Upiši naziv proizvoda"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Osnovna cena *
                            </label>
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">rsd</span>
                                <input
                                    {...register('price', { valueAsNumber: true })}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kategorija *
                            </label>
                            <select
                                {...register('categoryId', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                            >
                                <option key="default" value={0}>Odaberi kategoriju</option>
                                {categories.map((category, index) => (
                                    <option key={`category-${category.categoryId || index}`} value={category.categoryId}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tip proizvoda *
                            </label>
                            <select
                                {...register('productType', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                            >
                                <option value={0}>Fizički</option>
                                <option value={1}>Digitalni</option>
                            </select>
                            {errors.productType && (
                                <p className="mt-1 text-sm text-red-600">{errors.productType.message}</p>
                            )}
                        </div>

                        {/* Digital Product Fields - Only show for digital products */}
                        {selectedProductType === 1 && (
                            <>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Digitalni fajl
                                    </label>

                                    {/* Show existing digital file URL if product is being edited */}
                                    {!digitalFile && watch('digitalFileUrl') ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center flex-1 min-w-0">
                                                    <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                    </svg>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">Trenutni fajl:</p>
                                                        <p className="text-xs text-gray-600 truncate" title={watch('digitalFileUrl')}>
                                                            {watch('digitalFileUrl')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={watch('digitalFileUrl')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 p-1 text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0"
                                                    title="Otvori fajl"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </div>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                                                <input
                                                    type="file"
                                                    onChange={handleDigitalFileSelect}
                                                    className="hidden"
                                                    id="digital-file-upload"
                                                    accept=".pdf,.zip,.rar,.doc,.docx,.txt,.mp3,.mp4,.avi,.mov"
                                                />
                                                <label htmlFor="digital-file-upload" className="cursor-pointer">
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm font-medium text-gray-900">Zameni digitalni fajl</p>
                                                    <p className="text-xs text-gray-500 mt-1">Postavi novi fajl da zamenite postojeći</p>
                                                    <button
                                                        type="button"
                                                        className="mt-2 inline-flex items-center px-3 py-1.5 bg-brown text-white text-sm rounded-lg hover:bg-dark-grey transition-colors"
                                                    >
                                                        Izaberi novi fajl
                                                    </button>
                                                </label>
                                            </div>
                                        </div>
                                    ) : !digitalFile ? (
                                        <>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                                                <input
                                                    type="file"
                                                    onChange={handleDigitalFileSelect}
                                                    className="hidden"
                                                    id="digital-file-upload"
                                                    accept=".pdf,.zip,.rar,.doc,.docx,.txt,.mp3,.mp4,.avi,.mov"
                                                />
                                                <label htmlFor="digital-file-upload" className="cursor-pointer">
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm font-medium text-gray-900">Postavi digitalni fajl</p>
                                                    <p className="text-xs text-gray-500 mt-1">PDF, ZIP, DOC, Audio, Video fajlovi</p>
                                                    <button
                                                        type="button"
                                                        className="mt-2 inline-flex items-center px-3 py-1.5 bg-brown text-white text-sm rounded-lg hover:bg-dark-grey transition-colors"
                                                    >
                                                        Izaberi fajl
                                                    </button>
                                                </label>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">
                                                Ili unesite URL ako je fajl već postavljen negde:
                                            </p>
                                            <input
                                                {...register('digitalFileUrl')}
                                                type="url"
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent text-sm"
                                                placeholder="https://example.com/download-link"
                                            />
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{digitalFile.name}</p>
                                                    <p className="text-xs text-gray-500">{(digitalFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeDigitalFile}
                                                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2 flex items-center">
                                    <input
                                        {...register('isInstantDelivery')}
                                        type="checkbox"
                                        className="rounded border-gray-300 text-brown mr-2"
                                    />
                                    <label className="text-sm font-medium text-gray-700">
                                        Dozvoli instant preuzimanje nakon plaćanja
                                    </label>
                                </div>
                            </>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Opis *
                            </label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                placeholder="Upiši opis proizvoda"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Images */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Slike proizvoda</h2>

                    <div className="space-y-4">
                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-900">Dodaj slike proizvoda</p>
                                <p className="text-sm text-gray-500">PNG, JPG, GIF do 10MB</p>
                                <button
                                    type="button"
                                    className="mt-4 inline-flex items-center px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors"
                                >
                                    Izaberi fajlove
                                </button>
                            </label>
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={`preview-${index}-${preview.slice(-10)}`} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Variants */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Varijante</h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="inline-flex items-center px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Dodaj varijantu
                        </button>
                    </div>

                    {/* Helpful note based on product type */}
                    <div className="mb-6 p-3 bg-gray-50 border-l-4 border-beige rounded">
                        <p className="text-sm text-dark-grey">
                            {selectedProductType === 1
                                ? "Digitalni proizvodi: Kreiraj varijante za drugačije tipove licenci, periode pretplate, ili drugačije funkcionalnosti."
                                : "Fizički proizvodi: Kreiraj varijante za različite veličine, boje, materijale, ili druge fizičke atribute."
                            }
                        </p>
                    </div>

                    {variants.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Nema varijanti. Idi na "Dodaj varijantu" da kreiraš varijante proizvoda.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {variants.map((variant, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Varijanta {index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nova cena (osnovna: {watch('price')})
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">rsd</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={variant.priceOverride ?? variant.price ?? watch('price')}
                                                    onChange={(e) => {
                                                        const newPrice = parseFloat(e.target.value);
                                                        const basePrice = watch('price');
                                                        // If the new price equals base price, set priceOverride to null
                                                        // Otherwise, set it to the new price
                                                        const priceOverride = newPrice === basePrice ? null : newPrice;
                                                        updateVariant(index, 'priceOverride', priceOverride);
                                                        updateVariant(index, 'price', newPrice || basePrice);
                                                    }}
                                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Količina na stanju
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={variant.quantityInStock}
                                                onChange={(e) => updateVariant(index, 'quantityInStock', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Atributi
                                            </label>
                                            <div className="space-y-4">
                                                {attributes.map(attribute => (
                                                    <div key={attribute.id} className="border border-gray-200 rounded-lg p-4">
                                                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                                                            {attribute.name}
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {attribute.values.map(value => (
                                                                <button
                                                                    key={value.id}
                                                                    type="button"
                                                                    onClick={() => toggleAttributeValue(index, attribute.id, value.id)}
                                                                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                                                                        isAttributeValueSelected(index, value.id)
                                                                            ? 'bg-brown text-white border-dark-grey'
                                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                                >
                                                                    {value.value}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                {attributes.length === 0 && (
                                                    <p className="text-sm text-gray-500">
                                                        Nema dostupnih atributa.Kreiraj atribute prvo u sekciji atributa.
                                                    </p>
                                                )}
                                                {variant.attributes && variant.attributes.length > 0 && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">Selektovano:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {variant.attributes.map((attr, attrIndex) => (
                                                                <span
                                                                    key={`${attr.attributeName}-${attr.attributeValue}-${attrIndex}`}
                                                                    className="inline-flex items-center px-2 py-1 text-xs bg-white text-dark-grey rounded-full"
                                                                >
                                                                    {attr.attributeName}: {attr.attributeValue}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Poništi
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey disabled:bg-light-grey disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Saving...' : product ? 'Ažuriraj proizvod' : 'Kreiraj proizvod'}
                    </button>
                </div>
            </form>
        </div>
    );
}