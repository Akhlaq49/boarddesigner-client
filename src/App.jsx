import React from 'react';
import Header from './components/Header';
import ButtonParts from './components/ButtonParts';
import Frame from './components/Frame';
import ColorPalette from './components/ColorPalette';
import IconPopup from './components/IconPopup';
import ButtonColorPopup from './components/ButtonColorPopup';
import FeedbackMessage from './components/FeedbackMessage';
import { useDragDrop } from './hooks/useDragDrop';

function App() {
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
    getColorValue
  } = useDragDrop();

  return (
    <section className="fixed w-full h-full overflow-hidden">
      <div className="wrapper flex flex-col align-middle justify-center transition-colors duration-300 select-none" style={{ backgroundColor: '#f5f5f5' }}>
        <Header />
        
        <div className="container-fluid h-100" style={{ paddingTop: '80px' }}>
          <div className="row h-100 g-3">
            {/* Left Column - Button Parts */}
            <div className="col-md-3 col-lg-3 h-100 overflow-auto">
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
                    getColorValue={getColorValue}
                  />
                </div>
              </div>
            </div>

            {/* Center Column - Frame */}
            <div className="col-md-6 col-lg-6 h-100 d-flex align-items-center justify-content-center">
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
                setShowButtonColorPopup={setShowButtonColorPopup}
                setButtonColorTarget={setButtonColorTarget}
              />
            </div>

            {/* Right Column - Color Palette */}
            <div className="col-md-3 col-lg-3 h-100 overflow-auto">
              <div className="h-100">
                <div className="x-card bg-white dark:bg-secondary-800 overflow-hidden rounded-md shadow p-2 shadow-lg shadow-black/50 bg-slate-100">
                  <ColorPalette
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    applyFrameColor={applyFrameColor}
                    applyFullColor={applyFullColor}
                    showFeedback={showFeedback}
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

