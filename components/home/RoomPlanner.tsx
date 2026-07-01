'use client';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Product {
    id: number;
    name: string;
    images: string[];
    price: number;
}

interface PlacedItem {
    id: string;
    productId: number;
    productName: string;
    productImage: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}

export default function RoomPlanner({
    products,
    isOpen,
    onClose,
}: {
    products: Product[];
    isOpen: boolean;
    onClose: () => void;
}) {
    const [roomImage, setRoomImage] = useState<string | null>(null);
    const [roomImageFile, setRoomImageFile] = useState<File | null>(null);
    const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    const roomUploadRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    function handleRoomImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        setRoomImageFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            setRoomImage(event.target?.result as string);
            setPlacedItems([]);
            setSelectedItemId(null);
            toast.success('Room photo uploaded!');
        };
        reader.readAsDataURL(file);
    }

    function handleAddFurniture() {
        if (!selectedProduct || !roomImage) {
            toast.error('Select a product and upload a room photo first');
            return;
        }

        const newItem: PlacedItem = {
            id: `item-${Date.now()}`,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            productImage: selectedProduct.images[0],
            x: 50,
            y: 50,
            width: 120,
            height: 120,
            rotation: 0,
        };

        setPlacedItems([...placedItems, newItem]);
        toast.success(`${selectedProduct.name} added to room!`);
    }

    function handleRemoveItem(id: string) {
        setPlacedItems(placedItems.filter(item => item.id !== id));
        if (selectedItemId === id) setSelectedItemId(null);
    }

    function handleMouseDown(e: React.MouseEvent, itemId: string) {
        if ((e.target as HTMLElement).closest('[data-ignore-drag]')) return;
        setSelectedItemId(itemId);
        setIsDragging(true);
        const item = placedItems.find(i => i.id === itemId);
        if (item && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left - item.x,
                y: e.clientY - rect.top - item.y,
            });
        }
    }

    function handleMouseMove(e: React.MouseEvent) {
        if (!isDragging || !selectedItemId || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const newX = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 100));
        const newY = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 100));

        setPlacedItems(placedItems.map(item =>
            item.id === selectedItemId ? { ...item, x: newX, y: newY } : item
        ));
    }

    function handleMouseUp() {
        setIsDragging(false);
    }

    function updateItem(id: string, updates: Partial<PlacedItem>) {
        setPlacedItems(placedItems.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    }

    function handleShareWhatsApp() {
        if (placedItems.length === 0) {
            toast.error('Add furniture to your room plan first');
            return;
        }

        const itemsList = placedItems
            .map(item => `• ${item.productName} (KES ${products.find(p => p.id === item.productId)?.price.toLocaleString() || 'N/A'})`)
            .join('%0A');

        const message = `Hi! I'd like to discuss this room design:%0A%0A${itemsList}%0A%0ACan you help me with this?`;
        const whatsappUrl = `https://wa.me/254115990547?text=${message}`;
        window.open(whatsappUrl, '_blank');
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <h2 className="font-serif text-2xl font-bold">Virtual Room Planner</h2>
                        <p className="text-sm text-gray-500 mt-1">Upload your room photo and visualize furniture in your space</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">

                        {/* Left Panel - Controls */}
                        <div className="lg:col-span-1 space-y-4">

                            {/* Upload Room Photo */}
                            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
                                <h3 className="font-semibold text-sm mb-3 text-primary-900">Step 1: Upload Room</h3>
                                <div
                                    className="border-2 border-dashed border-primary-300 rounded-lg p-3 text-center cursor-pointer hover:border-primary-400 transition-colors"
                                    onClick={() => roomUploadRef.current?.click()}
                                >
                                    <svg className="w-5 h-5 text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 4v16m8-8H4" />
                                    </svg>
                                    <p className="text-xs font-medium text-primary-700">
                                        {roomImage ? 'Change Photo' : 'Upload Photo'}
                                    </p>
                                </div>
                                <input
                                    ref={roomUploadRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleRoomImageUpload}
                                />
                            </div>

                            {/* Select Furniture */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                <h3 className="font-semibold text-sm mb-3 text-blue-900">Step 2: Select Furniture</h3>
                                <select
                                    value={selectedProduct?.id || ''}
                                    onChange={(e) => {
                                        const prod = products.find(p => p.id === Number(e.target.value));
                                        setSelectedProduct(prod || null);
                                    }}
                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Choose a product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — KES {p.price.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAddFurniture}
                                    className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Add to Room
                                </button>
                            </div>

                            {/* Placed Items */}
                            {placedItems.length > 0 && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h3 className="font-semibold text-sm mb-3">Items in Room ({placedItems.length})</h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {placedItems.map(item => (
                                            <div
                                                key={item.id}
                                                onClick={() => setSelectedItemId(item.id)}
                                                className={`p-2 rounded-lg cursor-pointer text-xs transition-all ${selectedItemId === item.id
                                                        ? 'bg-primary-100 border border-primary-300'
                                                        : 'bg-white border border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <img src={item.productImage} alt={item.productName} className="w-8 h-8 object-cover rounded" />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-700 line-clamp-1">{item.productName}</p>
                                                        <p className="text-gray-500 text-xs">KES {products.find(p => p.id === item.productId)?.price.toLocaleString()}</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveItem(item.id);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 font-bold"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Selected Item Controls */}
                            {selectedItemId && (
                                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                                    <h3 className="font-semibold text-sm mb-3 text-yellow-900">Adjust Item</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Size</label>
                                            <input
                                                type="range"
                                                min="50"
                                                max="250"
                                                value={placedItems.find(i => i.id === selectedItemId)?.width || 120}
                                                onChange={(e) => updateItem(selectedItemId, { width: Number(e.target.value), height: Number(e.target.value) })}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Rotation</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="360"
                                                value={placedItems.find(i => i.id === selectedItemId)?.rotation || 0}
                                                onChange={(e) => updateItem(selectedItemId, { rotation: Number(e.target.value) })}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Share */}
                            {placedItems.length > 0 && (
                                <button
                                    onClick={handleShareWhatsApp}
                                    className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.969 1.523A9.865 9.865 0 005.064 9.51a9.87 9.87 0 001.523 4.969 9.865 9.865 0 004.969 1.524h.004c2.648 0 5.195-1.035 7.081-2.92a10.01 10.01 0 002.919-7.081 9.87 9.87 0 00-1.523-4.969A9.865 9.865 0 0012 2.05A9.87 9.87 0 007.05 3.574 9.865 9.865 0 005.13 8.544m11.313-5.867A11.9 11.9 0 0012 1c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 19.627 0 12 5.373 0 12 0z" />
                                    </svg>
                                    Share on WhatsApp
                                </button>
                            )}
                        </div>

                        {/* Right Panel - Canvas */}
                        <div className="lg:col-span-3">
                            {roomImage ? (
                                <div
                                    ref={canvasRef}
                                    className="relative w-full h-96 lg:h-full bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-200 cursor-move"
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                >
                                    {/* Room Background */}
                                    <img
                                        src={roomImage}
                                        alt="Room"
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Placed Furniture */}
                                    {placedItems.map(item => (
                                        <div
                                            key={item.id}
                                            onMouseDown={(e) => handleMouseDown(e, item.id)}
                                            className={`absolute transition-all ${selectedItemId === item.id
                                                    ? 'ring-2 ring-primary-400 shadow-lg'
                                                    : 'hover:ring-1 hover:ring-gray-400'
                                                }`}
                                            style={{
                                                left: `${item.x}px`,
                                                top: `${item.y}px`,
                                                width: `${item.width}px`,
                                                height: `${item.height}px`,
                                                transform: `rotate(${item.rotation}deg)`,
                                                cursor: isDragging && selectedItemId === item.id ? 'grabbing' : 'grab',
                                            }}
                                        >
                                            <img
                                                src={item.productImage}
                                                alt={item.productName}
                                                className="w-full h-full object-cover rounded-lg shadow-md"
                                            />
                                            {selectedItemId === item.id && (
                                                <div
                                                    className="absolute -top-8 left-0 bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap"
                                                    data-ignore-drag
                                                >
                                                    {item.productName}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {placedItems.length === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <p className="text-white text-center">
                                                <span className="block text-sm mb-2">👈 Add furniture from the left panel</span>
                                                <span className="text-xs opacity-75">Drag to move • Use controls to resize & rotate</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-96 lg:h-full bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500 text-sm font-medium">Upload a room photo to get started</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                        Close
                    </button>
                    {placedItems.length > 0 && (
                        <button
                            onClick={handleShareWhatsApp}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Share Plan on WhatsApp
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}