import React, { useState } from 'react';
import Header from './components/Header';
import ButtonParts from './components/ButtonParts';
import Frame from './components/Frame';
import ColorPalette from './components/ColorPalette';
import IconPopup from './components/IconPopup';
import ButtonColorPopup from './components/ButtonColorPopup';
import FeedbackMessage from './components/FeedbackMessage';
import { useDragDrop } from './hooks/useDragDrop';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('2-8 Room Controller');
  const [frameDownloadPDF, setFrameDownloadPDF] = useState(null);
  
  const {
    gridType,
    setGridType,
    selectedButton,
    setSelectedButton,
    dropZones,
    updateDropZone,
    clearDropZone,
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

  return (
    <section className="fixed w-full h-full" style={{ overflowX: 'auto', overflowY: 'auto' }}>
      <div className="wrapper flex flex-col align-middle justify-center transition-colors duration-300 select-none">
        <Header 
          boardWidth={boardWidth}
          setBoardWidth={setBoardWidth}
          colorPaletteWidth={colorPaletteWidth}
          setColorPaletteWidth={setColorPaletteWidth}
          onNavigateHome={() => window.location.reload()}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onDownloadPDF={() => frameDownloadPDF && frameDownloadPDF()}
        />
        
        <div className="container-fluid h-100" style={{ paddingTop: '90px',zIndex: 100, overflowX: 'auto' }}>
          <div className="row h-100 g-3" style={{ display: 'flex', margin: 0, flexWrap: 'nowrap', minWidth: 'fit-content' }}>
            {/* Left Column - Button Parts */}
            <div className="h-100 overflow-auto" style={{ 
              width: '25%',
              minWidth: '200px',
              
              flexShrink: 0,
              flexGrow: 0,
              padding: '0 8px',
              position: 'relative',
              zIndex: 1
            }}>
              <div className="h-100">
                <div className="x-card bg-white dark:bg-secondary-800 overflow-hidden rounded-md shadow p-2 shadow-lg shadow-black/50 bg-slate-100">
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
                  />
                </div>
              </div>
            </div>

            {/* Center Column - Frame */}
            <div className="h-100 d-flex align-items-center justify-content-center" style={{ 
              width: `${boardWidth}%`,
              minWidth: '300px',
              maxWidth: 'calc(100% - 500px)', // Ensure space for left (300px) + right (240px) columns
              flex: '1 1 auto',
              flexShrink: 1,
              padding: '0 8px',
              overflow: 'visible'
            }}>
              <Frame
                gridType={gridType}
                setGridType={setGridType}
                dropZones={dropZones}
                selectedButton={selectedButton}
                setSelectedButton={setSelectedButton}
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
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                setDownloadPDFHandler={setFrameDownloadPDF}
              />
            </div>

            {/* Right Column - Color Palette */}
            <div className="h-100 overflow-auto" style={{ 
             
              minWidth: '240px',
              maxWidth: '300px',
              flexShrink: 0,
              flexGrow: 0,
              padding: '0 8px 0 8px',
              marginRight: '0',
              position: 'relative',
              zIndex: 10,
              overflowX: 'visible',
              overflowY: 'auto'
            }}>
              <div className="h-100">
                <div className="x-card bg-white dark:bg-secondary-800 overflow-hidden rounded-md shadow p-2 shadow-lg shadow-black/50 bg-slate-100">
                  <ColorPalette
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    applyFrameColor={applyFrameColor}
                    applyFullColor={applyFullColor}
                    showFeedback={showFeedback}
                    applyWallColor={applyWallColor}
                    wallColor={wallColor}
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
      </div>
    </section>
  );
}

export default App;

