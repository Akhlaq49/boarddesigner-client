import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ButtonParts from './components/ButtonParts';
import Frame from './components/Frame';
import ColorPalette from './components/ColorPalette';
import IconPopup from './components/IconPopup';
import ButtonColorPopup from './components/ButtonColorPopup';
import FeedbackMessage from './components/FeedbackMessage';
import SaveDesign from './components/SaveDesign';
import { useDragDrop } from './hooks/useDragDrop';

function App() {
  const [frameDownloadPDF, setFrameDownloadPDF] = useState(null);
  const [showSaveDesignModal, setShowSaveDesignModal] = useState(false);
  
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

  const showButtonParts = activeTab === 'design-self' || activeTab.startsWith('pblock-level-');

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

  return (
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
          onOpenSaveDesign={() => setShowSaveDesignModal(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        <div className="container-fluid h-100 app-content">
          <div className="row h-100 g-3" style={{ display: 'flex', margin: 0, flexWrap: 'nowrap', minWidth: 'fit-content' }}>
            {/* Left Column - Button Parts (show only when Design Your Self is active) */}
            {showButtonParts && (
              <div className="h-100" style={{ 
                width: '25%',
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
                setGridType={setGridType}
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
                frameColor={frameColor}
                fullColor={fullColor}
                getColorValue={getColorValue}
                getTextureImage={getTextureImage}
                setShowButtonColorPopup={setShowButtonColorPopup}
                setButtonColorTarget={setButtonColorTarget}
                selectedButtonPart={selectedButtonPart}
                setSelectedButtonPart={setSelectedButtonPart}
                selectedColor={selectedColor}
                setDownloadPDFHandler={setFrameDownloadPDF}
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
          icons={icons}
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
  );
}

export default App;

