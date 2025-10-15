import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, ArrowLeft, Plus, Trash2, Package, DollarSign, Tag } from 'lucide-react';
import type { Product, Category, ProductVariant } from '../../../app/models/product';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0.01, 'Price must be greater than 0'),
    categoryId: z.number().min(1, 'Category is required'),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

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

interface VariantFormData {
    id?: number;
    attributeValueIds: number[];
    price?: number;
    quantityInStock: number;
    attributeCombination: string;
}

interface Props {
    product?: Product;
    onSubmit: (data: ProductFormData & { images: File[], variants: VariantFormData[] }) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function EnhancedProductForm({ product, onSubmit, onCancel, loading = false }: Props) {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [variants, setVariants] = useState<VariantFormData[]>([]);
    const [selectedAttributes, setSelectedAttributes] = useState<number[]>([]);
    const [generatingVariants, setGeneratingVariants] = useState(false);

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
            categoryId: product.categoryId,
            metaTitle: '',
            metaDescription: '',
        } : {
            name: '',
            description: '',
            price: 0,
            categoryId: 0,
            metaTitle: '',
            metaDescription: '',
        }
    });

    useEffect(() => {
        fetchCategories();
        fetchAttributes();

        if (product?.variants) {
            const formattedVariants = product.variants.map(variant => ({
                id: variant.productVariantId,
                attributeValueIds: variant.attributeValueIds,
                price: variant.price,
                quantityInStock: variant.quantityInStock,
                attributeCombination: variant.attributes?.map(attr => `${attr.attributeName}: ${attr.attributeValue}`).join(', ') || ''
            }));
            setVariants(formattedVariants);
        }
    }, [product]);

    const fetchCategories = async () => {
        try {
            const response = await agent.Admin.getCategories();
            setCategories(response);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const fetchAttributes = async () => {
        try {
            const response = await agent.Admin.getAttributes();
            setAttributes(response);
        } catch (error) {
            console.error('Failed to fetch attributes:', error);
            toast.error('Failed to load attributes');
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages(prev => [...prev, ...files]);

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

    const generateVariants = () => {
        if (selectedAttributes.length === 0) {
            toast.error('Please select attributes for variant generation');
            return;
        }

        setGeneratingVariants(true);

        const selectedAttributeObjects = attributes.filter(attr => selectedAttributes.includes(attr.id));
        const combinations: number[][] = [];

        // Generate all combinations of attribute values
        const generateCombinations = (attrIndex: number, currentCombination: number[]) => {
            if (attrIndex === selectedAttributeObjects.length) {
                combinations.push([...currentCombination]);
                return;
            }

            const attribute = selectedAttributeObjects[attrIndex];
            attribute.values.forEach(value => {
                currentCombination.push(value.id);
                generateCombinations(attrIndex + 1, currentCombination);
                currentCombination.pop();
            });
        };

        generateCombinations(0, []);

        const newVariants: VariantFormData[] = combinations.map(combination => {
            const attributeCombination = combination.map(valueId => {
                const attribute = selectedAttributeObjects.find(attr =>
                    attr.values.some(val => val.id === valueId)
                );
                const value = attribute?.values.find(val => val.id === valueId);
                return `${attribute?.name}: ${value?.value}`;
            }).join(', ');

            return {
                attributeValueIds: combination,
                quantityInStock: 0,
                attributeCombination
            };
        });

        setVariants(newVariants);
        setGeneratingVariants(false);
        toast.success(`Generated ${newVariants.length} variants`);
    };

    const updateVariant = (index: number, field: keyof VariantFormData, value: any) => {
        setVariants(prev => prev.map((variant, i) =>
            i === index ? { ...variant, [field]: value } : variant
        ));
    };

    const removeVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const addVariant = () => {
        setVariants(prev => [...prev, {
            attributeValueIds: [],
            quantityInStock: 0,
            attributeCombination: 'Manual variant'
        }]);
    };

    const onFormSubmit = (data: ProductFormData) => {
        if (variants.length === 0) {
            toast.error('Please add at least one variant');
            return;
        }

        const hasInvalidVariants = variants.some(variant =>
            variant.attributeValueIds.length === 0 || variant.quantityInStock < 0
        );

        if (hasInvalidVariants) {
            toast.error('Please ensure all variants have valid attributes and stock quantities');
            return;
        }

        onSubmit({
            ...data,
            images: selectedImages,
            variants
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onCancel}
                        className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {product ? 'Edit Product' : 'Create Product'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <Package className="w-5 h-5 text-indigo-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name *
                            </label>
                            <input
                                {...register('name')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter product name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Base Price *
                            </label>
                            <input
                                {...register('price', { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="0.00"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                {...register('categoryId', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value={0}>Select a category</option>
                                {categories.map(category => (
                                    <option key={category.categoryId} value={category.categoryId}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter product description"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Images</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />
                            </label>
                        </div>

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Variants */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Tag className="w-5 h-5 text-indigo-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">Product Variants</h2>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={addVariant}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                <Plus className="w-4 h-4 inline mr-1" />
                                Add Manual
                            </button>
                            <button
                                type="button"
                                onClick={generateVariants}
                                disabled={generatingVariants}
                                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Generate Variants
                            </button>
                        </div>
                    </div>

                    {/* Attribute Selection for Generation */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Attributes for Variant Generation
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {attributes.map(attribute => (
                                <label key={attribute.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedAttributes.includes(attribute.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedAttributes(prev => [...prev, attribute.id]);
                                            } else {
                                                setSelectedAttributes(prev => prev.filter(id => id !== attribute.id));
                                            }
                                        }}
                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{attribute.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Variants List */}
                    <div className="space-y-4">
                        {variants.map((variant, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {variant.attributeCombination || `Variant ${index + 1}`}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price Override (optional)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={variant.price || ''}
                                            onChange={(e) => updateVariant(index, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Leave empty to use base price"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Stock Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={variant.quantityInStock}
                                            onChange={(e) => updateVariant(index, 'quantityInStock', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {variants.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No variants added yet</p>
                                <p className="text-sm">Generate variants from attributes or add manually</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
                    </button>
                </div>
            </form>
        </div>
    );
}