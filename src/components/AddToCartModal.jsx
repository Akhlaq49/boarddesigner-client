import React, { useState } from 'react';

const AddToCartModal = ({ isOpen, onClose, dropZones, gridType, frameColor, fullColor, wallColor, captureFrameImage, addToCart }) => {
  const [designName, setDesignName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleAddToCart = async () => {
    if (!designName.trim()) {
      alert('Please enter a design name');
      return;
    }

    setLoading(true);
    try {
      // Capture the current design image
      let designImage = null;
      if (captureFrameImage) {
        designImage = await captureFrameImage();
      }

      const designData = {
        name: designName,
        category: gridType,
        gridType,
        frameColor,
        fullColor,
        wallColor,
        dropZones,
        designImage, // Store the captured image
        timestamp: new Date().toLocaleString()
      };

      addToCart(designData);
      setSuccessMessage(`✓ "${designName}" added to cart!`);
      setDesignName('');
      
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add design to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '400px',
          maxWidth: '500px'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333' }}>
          Add Design to Cart
        </h2>

        {successMessage && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '6px',
              marginBottom: '1rem',
              border: '1px solid #c3e6cb'
            }}
          >
            {successMessage}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#555'
            }}
          >
            Design Name:
          </label>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            placeholder="Enter design name"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '1rem',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'auto'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>Note:</strong> This will add your current design to the cart.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAddToCart}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
