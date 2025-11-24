import React, { useState, useRef, useEffect } from 'react';
import { toJpeg } from 'html-to-image';
import { useNavigate } from "react-router-dom";
import { useBoard } from '../context/BoardContext';
import HomeScreenBackground from '../assets/HomeScreenBackground.svg';
import { TbArrowBackUpDouble } from "react-icons/tb";
import { BsDownload } from "react-icons/bs";



interface BoardItem {
    id: string;
    url: string;
    state: 'bank' | 'canvas';
    x: number;
    y: number;
    width: number;
    height: number;
}

const CreateBoardPage = () => {
    const navigate = useNavigate();
    const { allPins } = useBoard();
    const [items, setItems] = useState<BoardItem[]>(() => {
        return allPins.map((pin, idx) => ({
            id: idx.toString(),
            url: pin.url,
            state: 'bank',
            x: 0,
            y: 0,
            width: pin.width,
            height: pin.height,
        }));
    });

    useEffect(() => {
        setItems(allPins.map((pin, idx) => ({
            id: idx.toString(),
            url: pin.url,
            state: 'bank',
            x: 0,
            y: 0,
            width: pin.width,
            height: pin.height,
        })));
    }, [allPins]);

    const [dragState, setDragState] = useState<{
        isDragging: boolean;
        itemId: string | null;
        startX: number;
        startY: number;
        initialItemX: number;
        initialItemY: number;
        dragOffsetX: number;
        dragOffsetY: number;
    }>({
        isDragging: false,
        itemId: null,
        startX: 0,
        startY: 0,
        initialItemX: 0,
        initialItemY: 0,
        dragOffsetX: 0,
        dragOffsetY: 0,
    });

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [resizeState, setResizeState] = useState<{
        isResizing: boolean;
        handle: string | null;
        startX: number;
        startY: number;
        initialX: number;
        initialY: number;
        initialWidth: number;
        initialHeight: number;
    }>({
        isResizing: false,
        handle: null,
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0,
        initialWidth: 0,
        initialHeight: 0,
    });

    const canvasRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent, itemId: string, fromCanvas: boolean, handle?: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (fromCanvas) {
            setSelectedItemId(itemId);
        }

        const item = items.find(i => i.id === itemId);
        if (!item) return;

        if (handle) {
            setResizeState({
                isResizing: true,
                handle,
                startX: e.clientX,
                startY: e.clientY,
                initialX: item.x,
                initialY: item.y,
                initialWidth: item.width,
                initialHeight: item.height,
            });
        } else {
            setDragState({
                isDragging: true,
                itemId,
                startX: e.clientX,
                startY: e.clientY,
                initialItemX: item.x,
                initialItemY: item.y,
                dragOffsetX: 0,
                dragOffsetY: 0,
            });
        }
    };

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (resizeState.isResizing && resizeState.handle) {
                const deltaX = e.clientX - resizeState.startX;
                const aspectRatio = resizeState.initialWidth / resizeState.initialHeight;

                let newWidth = resizeState.initialWidth;
                let newHeight = resizeState.initialHeight;
                let newX = resizeState.initialX;
                let newY = resizeState.initialY;

                if (resizeState.handle === 'br') {
                    newWidth = resizeState.initialWidth + deltaX;
                    newHeight = newWidth / aspectRatio;
                } else if (resizeState.handle === 'bl') {
                    newWidth = resizeState.initialWidth - deltaX;
                    newHeight = newWidth / aspectRatio;
                    newX = resizeState.initialX + deltaX;
                } else if (resizeState.handle === 'tr') {
                    newWidth = resizeState.initialWidth + deltaX;
                    newHeight = newWidth / aspectRatio;
                    newY = resizeState.initialY - (newHeight - resizeState.initialHeight);
                } else if (resizeState.handle === 'tl') {
                    newWidth = resizeState.initialWidth - deltaX;
                    newHeight = newWidth / aspectRatio;
                    newX = resizeState.initialX + deltaX;
                    newY = resizeState.initialY - (newHeight - resizeState.initialHeight);
                }

                if (newWidth < 50) {
                    newWidth = 50;
                    newHeight = 50 / aspectRatio;
                }

                setItems(prev => prev.map(item => {
                    if (item.id === selectedItemId) {
                        return {
                            ...item,
                            width: newWidth,
                            height: newHeight,
                            x: newX,
                            y: newY
                        };
                    }
                    return item;
                }));

            } else if (dragState.isDragging && dragState.itemId) {
                setDragState(prev => ({
                    ...prev,
                    dragOffsetX: e.clientX - prev.startX,
                    dragOffsetY: e.clientY - prev.startY,
                }));
            }
        };

        const handlePointerUp = (e: PointerEvent) => {
            if (resizeState.isResizing) {
                setResizeState(prev => ({ ...prev, isResizing: false, handle: null }));
                return;
            }

            if (!dragState.isDragging || !dragState.itemId) return;

            const draggedItem = items.find(i => i.id === dragState.itemId);
            if (!draggedItem) return;

            const canvasRect = canvasRef.current?.getBoundingClientRect();
            const isOverCanvas = canvasRect &&
                e.clientX >= canvasRect.left &&
                e.clientX <= canvasRect.right &&
                e.clientY >= canvasRect.top &&
                e.clientY <= canvasRect.bottom;

            if (isOverCanvas && canvasRect) {
                let newX, newY;

                if (draggedItem.state === 'canvas') {
                    newX = dragState.initialItemX + (e.clientX - dragState.startX);
                    newY = dragState.initialItemY + (e.clientY - dragState.startY);
                } else {
                    newX = e.clientX - canvasRect.left - (draggedItem.width / 2);
                    newY = e.clientY - canvasRect.top - (draggedItem.height / 2);
                }

                setItems(prev => prev.map(item => {
                    if (item.id === dragState.itemId) {
                        return { ...item, state: 'canvas', x: newX, y: newY };
                    }
                    return item;
                }));
                setSelectedItemId(dragState.itemId);
            } else {
                setItems(prev => prev.map(item => {
                    if (item.id === dragState.itemId) {
                        return { ...item, state: 'bank', x: 0, y: 0 };
                    }
                    return item;
                }));
                setSelectedItemId(null);
            }

            setDragState({
                isDragging: false,
                itemId: null,
                startX: 0,
                startY: 0,
                initialItemX: 0,
                initialItemY: 0,
                dragOffsetX: 0,
                dragOffsetY: 0,
            });
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [dragState, items, resizeState, selectedItemId]);

    const handleRemoveItem = (itemId: string) => {
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                return { ...item, state: 'bank', x: 0, y: 0 };
            }
            return item;
        }));
        setSelectedItemId(null);
    };

    const bankItems = items.filter(i => i.state === 'bank');
    const canvasItems = items.filter(i => i.state === 'canvas');

    const distributeItems = () => {
        const top: BoardItem[] = [];
        const right: BoardItem[] = [];
        const bottom: BoardItem[] = [];
        const left: BoardItem[] = [];

        bankItems.forEach((item, index) => {
            const mod = index % 4;
            if (mod === 0) top.push(item);
            else if (mod === 1) right.push(item);
            else if (mod === 2) bottom.push(item);
            else left.push(item);
        });
        return { top, right, bottom, left };
    };

    const handleDownload = async () => {
        if (canvasRef.current === null) {
            return;
        }

        const originalSrcs = new Map<HTMLImageElement, string>();

        try {
            console.log('=== DOWNLOAD STARTED ===');

            const imageMap = new Map<string, string>();
            const uniqueUrls = Array.from(new Set(canvasItems.map(item => item.url)));

            console.log(`Fetching ${uniqueUrls.length} unique image URLs`);

            await Promise.all(uniqueUrls.map(async (url) => {
                try {
                    const base64 = await window.electron.fetchImageBase64(url);
                    imageMap.set(url, base64);
                    console.log(`✓ Fetched: ${url.substring(0, 50)}...`);
                } catch (e) {
                    console.error(`✗ Failed: ${url}`, e);
                }
            }));

            console.log(`ImageMap has ${imageMap.size} entries`);

            // Replace src in the ACTUAL DOM before calling toJpeg
            const images = canvasRef.current.getElementsByTagName('img');
            console.log(`Found ${images.length} images in actual DOM`);

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const originalUrl = img.src;

                originalSrcs.set(img, originalUrl);

                if (imageMap.has(originalUrl)) {
                    img.src = imageMap.get(originalUrl)!;
                    console.log(`Image ${i}: Replaced (exact match)`);
                } else {
                    let found = false;
                    for (const [key, val] of imageMap.entries()) {
                        if (originalUrl.includes(key) || key.includes(originalUrl)) {
                            img.src = val;
                            console.log(`Image ${i}: Replaced (partial match)`);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        console.warn(`Image ${i}: No match found!`);
                    }
                }
            }

            console.log('Calling toJpeg...');
            const dataUrl = await toJpeg(canvasRef.current, {
                quality: 0.95,
                skipOnError: true,
            } as any);

            console.log('toJpeg completed successfully');
            await window.electron.saveCanvasImage(dataUrl);
            console.log('=== DOWNLOAD COMPLETED ===');
        } catch (err) {
            console.error('=== DOWNLOAD FAILED ===');
            console.error('Error:', err);
        } finally {
            console.log('Restoring original image sources...');
            for (const [img, originalSrc] of originalSrcs.entries()) {
                img.src = originalSrc;
            }
            console.log('Image sources restored');
        }
    };

    const { top, right, bottom, left } = distributeItems();

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden select-none"
            onClick={() => setSelectedItemId(null)}
        >

            <img src={HomeScreenBackground} className="absolute object-cover  w-full h-full top-0 left-0 z-[-100] opacity-25" alt="background" />

            {/* Top Bar */}
            <div className="h-32 flex items-center justify-between px-4 z-10 relative"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => navigate("/board-manager")}
                    className="px-6 py-2 rounded-full text-2xl border-2 border-red-500 hover:bg-red-500 cur hover:text-white transition-colors"
                >
                    <TbArrowBackUpDouble/>
                </button>
                <div className="flex gap-4 overflow-x-auto p-2 flex-1 justify-center">
                    {top.map(item => (
                        <div
                            key={item.id}
                            onPointerDown={(e) => handlePointerDown(e, item.id, false)}
                            className="w-24 h-24 rounded-lg cursor-grab active:cursor-grabbing shrink-0 overflow-hidden"
                        >
                            <img src={item.url} alt="" className="w-full h-full object-cover pointer-events-none" />
                        </div>
                    ))}
                </div>
                <div className="w-20"></div>
            </div>

            {/* Middle */}
            <div className="flex-1 flex overflow-hidden">
                <div className="w-32 flex flex-col items-center gap-4 py-4 z-10 overflow-y-auto hide-scrollbar"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {left.map(item => (
                        <div
                            key={item.id}
                            onPointerDown={(e) => handlePointerDown(e, item.id, false)}
                            className="w-24 h-24 rounded-lg cursor-grab active:cursor-grabbing shrink-0 overflow-hidden"
                        >
                            <img src={item.url} alt="" className="w-full h-full object-cover pointer-events-none" />
                        </div>
                    ))}
                </div>

                <div ref={canvasRef} className="flex-1 border-2 border-dashed border-black rounded-xl relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-700 pointer-events-none">
                        <span className="text-3xl">Drag images here</span>
                    </div>

                    {canvasItems.map(item => (
                        <div
                            key={item.id}
                            onPointerDown={(e) => handlePointerDown(e, item.id, true)}
                            style={{
                                position: 'absolute',
                                left: dragState.itemId === item.id ? item.x + dragState.dragOffsetX : item.x,
                                top: dragState.itemId === item.id ? item.y + dragState.dragOffsetY : item.y,
                                width: item.width,
                                height: item.height,
                                zIndex: dragState.itemId === item.id ? 50 : (selectedItemId === item.id ? 40 : 10),
                                cursor: dragState.itemId === item.id ? 'grabbing' : 'grab',
                            }}
                            className={`rounded-md group transition-colors ${selectedItemId === item.id ? 'ring-1 ring-gray-700' : 'hover:ring-1 hover:ring-black'}`}
                        >
                            <img src={item.url} alt="" className="w-full h-full object-cover pointer-events-none rounded-md" />

                            {selectedItemId === item.id && !dragState.isDragging && (
                                <>
                                    <button
                                        onPointerDown={(e) => {
                                            e.stopPropagation();
                                            handleRemoveItem(item.id);
                                        }}
                                        className="absolute -top-7 -right-7 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 z-50"
                                    >
                                        ×
                                    </button>

                                    <div
                                        className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-black border border-white rounded-full cursor-nwse-resize z-50"
                                        onPointerDown={(e) => handlePointerDown(e, item.id, true, 'tl')}
                                    />
                                    <div
                                        className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-black border border-white rounded-full cursor-nesw-resize z-50"
                                        onPointerDown={(e) => handlePointerDown(e, item.id, true, 'tr')}
                                    />
                                    <div
                                        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-black border border-white rounded-full cursor-nesw-resize z-50"
                                        onPointerDown={(e) => handlePointerDown(e, item.id, true, 'bl')}
                                    />
                                    <div
                                        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-black border border-white rounded-full cursor-nwse-resize z-50"
                                        onPointerDown={(e) => handlePointerDown(e, item.id, true, 'br')}
                                    />
                                </>
                            )}
                        </div>
                    ))}

                    {dragState.isDragging && items.find(i => i.id === dragState.itemId)?.state === 'bank' && (
                        <div
                            style={{
                                position: 'fixed',
                                left: dragState.startX + dragState.dragOffsetX - 50,
                                top: dragState.startY + dragState.dragOffsetY - 50,
                                width: 100,
                                height: 100,
                                zIndex: 100,
                                pointerEvents: 'none',
                            }}
                            className="rounded-lg overflow-hidden opacity-90 border-2 border-black"
                        >
                            <img
                                src={items.find(i => i.id === dragState.itemId)?.url}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>

                <div className="w-32 flex flex-col items-center gap-4 py-4  z-10 overflow-y-auto hide-scrollbar"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {right.map(item => (
                        <div
                            key={item.id}
                            onPointerDown={(e) => handlePointerDown(e, item.id, false)}
                            className="w-24 h-24 bg-neutral-800 rounded-lg cursor-grab active:cursor-grabbing shrink-0 overflow-hidden"
                        >
                            <img src={item.url} alt="" className="w-full h-full object-cover pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="h-32 flex items-center justify-between px-4 z-10 relative"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <div className="w-20"></div>
                <div className="flex gap-4 overflow-x-auto p-2 flex-1 justify-center">
                    {bottom.map(item => (
                        <div
                            key={item.id}
                            onPointerDown={(e) => handlePointerDown(e, item.id, false)}
                            className="w-24 h-24 bg-neutral-800 rounded-lg cursor-grab active:cursor-grabbing shrink-0 overflow-hidden"
                        >
                            <img src={item.url} alt="" className="w-full h-full object-cover pointer-events-none" />
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleDownload}
                    className="px-6 py-2 border-2 border-red-500 hover:bg-red-500 text-black hover:text-white rounded-full transition-colors shadow-lg shadow-green-900/20 font-medium flex items-center gap-2"
                >
                    Download JPEG 
                    <BsDownload/>
                </button>
            </div>
        </div>
    );
}

export default CreateBoardPage;