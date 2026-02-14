import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../hooks/useCart';

function SaveDesign({ isOpen, onClose, dropZones, gridType, frameColor, fullColor, wallColor, onLoadDesign }) {
  const { addToCart } = useCart();
  // Auto-select category based on current gridType
  const getDefaultCategory = (gt) => {
    if (!gt) return '2-8';
    if (gt.startsWith('pblock-2x2') || gt === 'pblock-2x6') return 'pblock-level-2';
    if (gt.startsWith('pblock-3x2')) return 'pblock-level-3';
    if (gt.startsWith('pblock-4x2') || gt === 'pblock-2x4') return 'pblock-level-4';
    return '2-8';
  };
  const [category, setCategory] = useState(() => getDefaultCategory(gridType));
  const [designName, setDesignName] = useState('');
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [showList, setShowList] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Update category when modal opens with a different gridType
  useEffect(() => {
    if (isOpen) {
      setCategory(getDefaultCategory(gridType));
    }
  }, [isOpen, gridType]);

  const loadDesigns = useCallback(async () => {
    try {
      const response = await fetch(`/designs.json?ts=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to load designs');
      const data = await response.json();
      const allDesigns = data.designs || [];
      const filteredDesigns = allDesigns.filter(d => d.category === category);
      setSavedDesigns(filteredDesigns);
    } catch (error) {
      console.error('Error loading designs:', error);
      setSavedDesigns([]);
    }
  }, [category]);

  // Load designs from API on mount and when category changes
  useEffect(() => {
    loadDesigns();
  }, [category, loadDesigns]);

  const addDesignToCart = async () => {
    if (!designName.trim()) {
      alert('Please enter a design name');
      return;
    }

    const designData = {
      name: designName,
      category,
      timestamp: new Date().toLocaleString(),
      gridType,
      dropZones,
      frameColor,
      fullColor,
      wallColor
    };

    try {
      addToCart(designData);
      setDesignName('');
      alert(`Design "${designName}" added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add design to cart');
    }
  };

  const saveDesign = async () => {
    if (!designName.trim()) {
      alert('Please enter a design name');
      return;
    }

    const designData = {
      id: Date.now().toString(),
      name: designName,
      category,
      timestamp: new Date().toLocaleString(),
      gridType,
      dropZones,
      frameColor,
      fullColor,
      wallColor
    };

    try {
      // Check if design already exists
      const existing = savedDesigns.find(d => d.name === designName);
      if (existing) {
        if (!window.confirm(`Design "${designName}" already exists. Do you want to replace it?`)) {
          return;
        }
      }

      // Save to backend API
      const response = await fetch('http://localhost:5000/api/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(designData)
      });

      if (!response.ok) throw new Error('Failed to save design');

      setDesignName('');
      alert(`Design "${designName}" saved successfully in ${category} category!`);
      // Trigger header refresh
      window.dispatchEvent(new CustomEvent('designsSaved'));
      // Reload designs
      loadDesigns();
      onClose();
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Failed to save design');
    }
  };

  const loadDesignFromList = (design) => {
    try {
      if (onLoadDesign) {
        onLoadDesign(design);
      }
      onClose();
    } catch (error) {
      console.error('Error loading design:', error);
      alert('Failed to load design');
    }
  };

  const deleteDesign = async (designName) => {
    try {
      // Delete via backend API
      const response = await fetch(`http://localhost:5000/api/designs?name=${encodeURIComponent(designName)}&category=${category}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete design');

      // Trigger header refresh
      window.dispatchEvent(new CustomEvent('designsSaved'));
      // Reload designs
      await loadDesigns();
      setDeleteConfirm(null);
      alert('Design deleted successfully');
    } catch (error) {
      console.error('Error deleting design:', error);
      alert('Failed to delete design');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        minWidth: '400px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333' }}>
          {showList ? 'Manage Designs' : 'Save Design'}
        </h2>

        {!showList ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              >
                <option value="2-8">2-8 Buttons Switch</option>
                <option value="3-12">3-12 Button Switch</option>
                <option value="2-8-room">2-8 Room Controller</option>
                <option value="pblock-level-2">PBlock Level 2</option>
                <option value="pblock-level-3">PBlock Level 3</option>
                <option value="pblock-level-4">PBlock Level 4</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>
                Design Name:
              </label>
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                placeholder="Enter design name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowList(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                View Saved Designs
              </button>
              <button
                onClick={addDesignToCart}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                Add to Cart
              </button>
              <button
                onClick={saveDesign}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                Save Design
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>
                Category: <strong>{category}</strong>
              </label>
            </div>

            {savedDesigns.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>
                No designs saved in this category yet.
              </p>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                {savedDesigns.map((design, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '500', color: '#333', marginBottom: '0.25rem' }}>
                        {design.name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#999' }}>
                        Saved: {design.timestamp}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => loadDesignFromList(design)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => addToCart(design)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(design.name)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {deleteConfirm && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '6px',
                marginBottom: '1rem'
              }}>
                <p style={{ marginTop: 0, color: '#856404' }}>
                  Are you sure you want to delete "{deleteConfirm}"?
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => deleteDesign(deleteConfirm)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#666',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowList(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                Back
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SaveDesign;
