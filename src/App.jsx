import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ButtonParts from './components/ButtonParts';
import Frame from './components/Frame';
import ColorPalette from './components/ColorPalette';
import IconPopup from './components/IconPopup';
import ButtonColorPopup from './components/ButtonColorPopup';
import FeedbackMessage from './components/FeedbackMessage';
import AddToCartModal from './components/AddToCartModal';
import CartView from './components/CartView';
import SaveDesign from './components/SaveDesign';
import { useDragDrop } from './hooks/useDragDrop';
import { useCart } from './hooks/useCart';

function App() {
  const [frameDownloadPDF, setFrameDownloadPDF] = useState(null);
  const [frameCaptureImage, setFrameCaptureImage] = useState(null);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showSaveDesignModal, setShowSaveDesignModal] = useState(false);
  
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  
  // Check if we're in cart view mode
  const isCartView = new URLSearchParams(window.location.search).get('view') === 'cart';
  
  const {
    gridType,
    setGridType,
    selectedButton,
    setSelectedButton,
    dropZones,
    updateDropZone,
    clearDropZone,
    loadDesign,
    resetDesign,
    applyFrameColor,
    applyFullColor,
    selectedColor,
    setSelectedColor,
    frameColor,
    fullColor,
    icons,
    pblockIcons,
    showIconPopup,
    setShowIconPopup,
    currentIconPosition,
    setCurrentIconPosition,
    showButtonColorPopup,
    setShowButtonColorPopup,
    buttonColorTarget,
    setButtonColorTarget,
    feedback,
    showFeedback,
    applyIconToButton,
    applyTextToButton,
    applyButtonColor,
    getButtonDimensions,
    placeButtonInZones,
    getColorValue,
    getTextureImage,
    getTextColorForBackground,
    boardWidth,
    setBoardWidth,
    colorPaletteWidth,
    setColorPaletteWidth,
    wallColor,
    applyWallColor,
    selectedButtonPart,
    setSelectedButtonPart
  } = useDragDrop();

  // Track active category tab
  const [activeTab, setActiveTab] = useState('2-8-buttons');

  // Track ButtonParts internal tab (parts vs label/icon-text)
  const [buttonPartsActiveTab, setButtonPartsActiveTab] = useState('parts');

  const showButtonParts = activeTab === 'design-self' || activeTab.startsWith('pblock-level-');
  
  // Use PBlock-specific icons when in PBlock layout
  const isPBlock = activeTab.startsWith('pblock-level-');
  const activeIcons = isPBlock ? pblockIcons : icons;

  const handleGridTypeChange = (nextGridType) => {
    resetDesign();
    setGridType(nextGridType);
  };

  // Listen for saved design load events
  useEffect(() => {
    const handleLoadSavedDesign = (event) => {
      const designData = event.detail;
      if (designData) {
        loadDesign(designData);
      }
    };

    window.addEventListener('loadSavedDesign', handleLoadSavedDesign);
    return () => {
      window.removeEventListener('loadSavedDesign', handleLoadSavedDesign);
    };
  }, [loadDesign]);

  // Auto-load design 00001 on page load
  useEffect(() => {
    const autoLoadDesign = async () => {
      try {
        const response = await fetch(`/designs.json?ts=${Date.now()}`);
        if (!response.ok) return;
        const data = await response.json();
        const design00001 = data.designs?.find(d => d.name === '00001');
        if (design00001) {
          loadDesign(design00001);
        }
      } catch (error) {
        console.error('Error auto-loading design 00001:', error);
      }
    };

    if (!isCartView) {
      autoLoadDesign();
    }
  }, [loadDesign, isCartView]);

  return (
    <>
      {isCartView ? (
        // Cart View - Full Screen in New Window
        <CartView
          isOpen={true}
          isNewWindow={true}
          onClose={() => window.close()}
          cart={cart}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
        />
      ) : (
        // Designer View - Main App
        <section className="fixed w-full h-full" style={{ overflowX: 'auto', overflowY: 'auto' }}>
      <div className="wrapper flex flex-col align-middle justify-center transition-colors duration-300 select-none">
        <Header 
          boardWidth={boardWidth}
          setBoardWidth={setBoardWidth}
          colorPaletteWidth={colorPaletteWidth}
          setColorPaletteWidth={setColorPaletteWidth}
          onNavigateHome={() => window.location.reload()}
          gridType={gridType}
          setGridType={handleGridTypeChange}
          onDownloadPDF={() => frameDownloadPDF && frameDownloadPDF()}
          setSelectedButton={setSelectedButton}
          setSelectedButtonPart={setSelectedButtonPart}
          onOpenAddToCart={() => setShowAddToCartModal(true)}
          onOpenCart={() => window.open('/?view=cart', 'cart', 'width=1200,height=800')}
          onOpenSaveDesign={() => setShowSaveDesignModal(true)}
          cartCount={cart.length}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        <div className="container-fluid h-100 app-content">
          <div className="row h-100 g-3" style={{ display: 'flex', margin: 0, flexWrap: 'nowrap', minWidth: 'fit-content' }}>
            {/* Left Column - Button Parts (show only when Design Your Self is active) */}
            {showButtonParts && (
              <div className="h-100" style={{ 
                width: '20%',
                minWidth: '200px',
                
                flexShrink: 0,
                flexGrow: 0,
                padding: '0 8px',
                position: 'relative',
                zIndex: 1001
              }}>
                <div className="h-100">
                  <div className="x-card bg-white dark:bg-secondary-800 rounded-md shadow p-2 shadow-lg shadow-black/50 bg-slate-100" style={{ overflow: 'visible' }}>
                    <ButtonParts
                      selectedButton={selectedButton}
                      setSelectedButton={setSelectedButton}
                      showIconPopup={showIconPopup}
                      setShowIconPopup={setShowIconPopup}
                      setCurrentIconPosition={setCurrentIconPosition}
                      applyIconToButton={applyIconToButton}
                      applyTextToButton={applyTextToButton}
                      showFeedback={showFeedback}
                      fullColor={fullColor}
                      selectedColor={selectedColor}
                      getColorValue={getColorValue}
                      getTextureImage={getTextureImage}
                      dropZones={dropZones}
                      selectedButtonPart={selectedButtonPart}
                      setSelectedButtonPart={setSelectedButtonPart}
                      labelOnly={activeTab.startsWith('pblock-level-')}
                      onActiveTabChange={setButtonPartsActiveTab}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Center Column - Frame */}
            <div className="h-100 d-flex align-items-center justify-content-center" style={{ 
              width: `${boardWidth}%`,
              minWidth: '300px',
              maxWidth: 'calc(100% - 500px)', // Ensure space for left (300px) + right (240px) columns
              flex: '1 1 auto',
              flexShrink: 1,
              padding: '0 8px',
              overflow: 'visible',
              position: 'relative',
              zIndex: 1001
            }}>
              <Frame
                gridType={gridType}
                setGridType={handleGridTypeChange}
                dropZones={dropZones}
                selectedButton={selectedButton}
                setSelectedButton={setSelectedButton}
                setShowIconPopup={setShowIconPopup}
                setCurrentIconPosition={setCurrentIconPosition}
                updateDropZone={updateDropZone}
                clearDropZone={clearDropZone}
                getButtonDimensions={getButtonDimensions}
                placeButtonInZones={placeButtonInZones}
                showFeedback={showFeedback}
                applyFrameColor={applyFrameColor}
                applyFullColor={applyFullColor}
                applyButtonColor={applyButtonColor}
                frameColor={frameColor}
                fullColor={fullColor}
                getColorValue={getColorValue}
                getTextureImage={getTextureImage}
                getTextColorForBackground={getTextColorForBackground}
                setShowButtonColorPopup={setShowButtonColorPopup}
                setButtonColorTarget={setButtonColorTarget}
                selectedButtonPart={selectedButtonPart}
                setSelectedButtonPart={setSelectedButtonPart}
                selectedColor={selectedColor}
                isLabelMode={buttonPartsActiveTab === 'label'}
                setDownloadPDFHandler={setFrameDownloadPDF}
                setCaptureImageHandler={setFrameCaptureImage}
                wallColor={wallColor}
              />
            </div>

            {/* Right Column - Color Palette */}
            <div className="h-100" style={{ 
             
              minWidth: '240px',
              maxWidth: '300px',
              flexShrink: 0,
              flexGrow: 0,
              padding: '0 8px 0 8px',
              marginRight: '0',
              position: 'relative',
              zIndex: 1001
            }}>
              <div className="h-100">
                <div className="x-card bg-white dark:bg-secondary-800 rounded-md shadow p-2 shadow-lg shadow-black/50 bg-slate-100" style={{ overflow: 'visible' }}>
                  <ColorPalette
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    applyFrameColor={applyFrameColor}
                    applyFullColor={applyFullColor}
                    applyButtonColor={applyButtonColor}
                    showFeedback={showFeedback}
                    applyWallColor={applyWallColor}
                    wallColor={wallColor}
                    selectedButton={selectedButton}
                    selectedMenu={activeTab}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <IconPopup
          show={showIconPopup}
          onClose={() => setShowIconPopup(false)}
          icons={activeIcons}
          onSelectIcon={(iconPath) => {
            if (currentIconPosition && selectedButton) {
              applyIconToButton(selectedButton, currentIconPosition, iconPath);
            }
            setShowIconPopup(false);
          }}
        />

        <ButtonColorPopup
          show={showButtonColorPopup}
          onClose={() => setShowButtonColorPopup(false)}
          onSelectColor={(colorName) => {
            if (buttonColorTarget) {
              applyButtonColor(buttonColorTarget, colorName);
            }
            setShowButtonColorPopup(false);
          }}
        />

        <FeedbackMessage feedback={feedback} />

        <AddToCartModal
          isOpen={showAddToCartModal}
          onClose={() => setShowAddToCartModal(false)}
          dropZones={dropZones}
          gridType={gridType}
          frameColor={frameColor}
          fullColor={fullColor}
          wallColor={wallColor}
          captureFrameImage={frameCaptureImage}
          addToCart={addToCart}
        />

        <CartView
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          cart={cart}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
        />

        <SaveDesign
          isOpen={showSaveDesignModal}
          onClose={() => setShowSaveDesignModal(false)}
          dropZones={dropZones}
          gridType={gridType}
          frameColor={frameColor}
          fullColor={fullColor}
          wallColor={wallColor}
          onLoadDesign={loadDesign}
        />
      </div>
    </section>
      )}
    </>
  );
}

export default App;

