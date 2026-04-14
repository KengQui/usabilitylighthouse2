// ButtonStrategy.js - Unified button creation and management system

class ButtonStrategy {
    constructor() {
        this.buttonTypes = {
            PRIMARY: 'primary',
            SECONDARY: 'secondary',
            PILL: 'pill',
            RADIO: 'radio',
            CHECKBOX: 'checkbox',
            ACTION: 'action',
            FLOATING: 'floating'
        };

        this.buttonSizes = {
            SMALL: 'small',
            MEDIUM: 'medium',
            LARGE: 'large'
        };

        this.buttonStates = {
            DEFAULT: 'default',
            HOVER: 'hover',
            ACTIVE: 'active',
            DISABLED: 'disabled',
            LOADING: 'loading'
        };
    }

    /**
     * Create a button element based on configuration
     * @param {Object} config - Button configuration object
     * @returns {HTMLElement} Button element
     */
    createButton(config) {
        const {
            type = this.buttonTypes.PILL,
            text = '',
            action = '',
            size = this.buttonSizes.MEDIUM,
            icon = null,
            iconPosition = 'left',
            className = '',
            onClick = null,
            disabled = false,
            loading = false,
            attributes = {}
        } = config;

        // Create button element
        const button = document.createElement('button');
        
        // Apply base classes
        const baseClass = this.getBaseClass(type);
        const sizeClass = this.getSizeClass(type, size);
        button.className = `${baseClass} ${sizeClass} ${className}`.trim();

        // Set button content
        const content = this.createButtonContent({
            text,
            icon,
            iconPosition,
            loading,
            type
        });
        button.innerHTML = content;

        // Set attributes
        if (action) {
            button.setAttribute('data-action', action);
        }

        if (disabled) {
            button.disabled = true;
            button.classList.add('disabled');
        }

        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        }

        // Apply additional attributes
        Object.entries(attributes).forEach(([key, value]) => {
            button.setAttribute(key, value);
        });

        // Add click handler
        if (onClick) {
            button.addEventListener('click', (e) => {
                if (!button.disabled && !button.classList.contains('loading')) {
                    onClick(e, action);
                }
            });
        } else if (action) {
            // Default click handler for actions
            button.addEventListener('click', (e) => {
                if (!button.disabled && !button.classList.contains('loading')) {
                    this.handleButtonClick(action, button);
                }
            });
        }

        return button;
    }

    /**
     * Create button content with icon and text
     */
    createButtonContent({ text, icon, iconPosition, loading, type }) {
        if (loading) {
            return `
                <span class="button-spinner"></span>
                <span class="button-text">Loading...</span>
            `;
        }

        let content = '';
        
        if (icon && iconPosition === 'left') {
            content += this.createIcon(icon, type);
        }

        if (text) {
            content += `<span class="button-text">${text}</span>`;
        }

        if (icon && iconPosition === 'right') {
            content += this.createIcon(icon, type);
        }

        return content || text;
    }

    /**
     * Create icon element
     */
    createIcon(icon, type) {
        if (icon.startsWith('material-')) {
            const iconName = icon.replace('material-', '');
            return `<i class="material-icons button-icon">${iconName}</i>`;
        }
        
        // Support for custom SVG icons
        if (icon.includes('<svg')) {
            return `<span class="button-icon">${icon}</span>`;
        }

        // Default icon handling
        return `<span class="button-icon">${icon}</span>`;
    }

    /**
     * Get base class for button type
     */
    getBaseClass(type) {
        const classMap = {
            [this.buttonTypes.PRIMARY]: 'wizard-btn wizard-btn-primary',
            [this.buttonTypes.SECONDARY]: 'wizard-btn wizard-btn-secondary',
            [this.buttonTypes.PILL]: 'pill-btn',
            [this.buttonTypes.RADIO]: 'radio-btn',
            [this.buttonTypes.CHECKBOX]: 'checkbox-btn',
            [this.buttonTypes.ACTION]: 'action-btn',
            [this.buttonTypes.FLOATING]: 'progress-floating-button'
        };

        return classMap[type] || 'pill-btn';
    }

    /**
     * Get size class for button
     */
    getSizeClass(type, size) {
        // Primary and secondary buttons have explicit size classes
        if ([this.buttonTypes.PRIMARY, this.buttonTypes.SECONDARY].includes(type)) {
            return `btn-${size}`;
        }
        return '';
    }

    /**
     * Handle default button click
     */
    handleButtonClick(action, button) {
        // Remove loading state from any previous buttons
        document.querySelectorAll('.loading').forEach(btn => {
            if (btn !== button) {
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        });

        // Add loading state to clicked button
        button.classList.add('loading');
        button.disabled = true;

        // Call the global handler
        if (typeof handlePillClick === 'function') {
            handlePillClick(action);
        }
    }

    /**
     * Create a group of buttons (pills)
     */
    createButtonGroup(buttons, options = {}) {
        const {
            style = 'pills',
            containerClass = '',
            layout = 'horizontal'
        } = options;

        const container = document.createElement('div');
        
        // Set container class based on style
        const containerClasses = {
            pills: 'suggested-pills',
            radio: 'suggested-radios',
            checkbox: 'suggested-checkboxes',
            'two-tier': 'two-tier-container',
            wizard: 'wizard-actions'
        };

        container.className = `${containerClasses[style] || 'suggested-pills'} ${containerClass} layout-${layout}`.trim();

        // Create buttons based on style
        if (style === 'two-tier') {
            return this.createTwoTierButtons(buttons, container);
        }

        // Create standard buttons
        buttons.forEach(buttonConfig => {
            const button = this.createButton({
                ...buttonConfig,
                type: this.getTypeForStyle(style),
                onClick: buttonConfig.onClick || ((e, action) => {
                    if (style === 'radio') {
                        this.handleRadioClick(e.target);
                    } else if (style === 'checkbox') {
                        this.handleCheckboxClick(e.target);
                    }
                    this.handleButtonClick(action, e.target);
                })
            });

            container.appendChild(button);
        });

        // Add submit button for checkbox groups
        if (style === 'checkbox') {
            const submitButton = this.createButton({
                type: this.buttonTypes.PRIMARY,
                text: 'Continue',
                className: 'mt-3',
                onClick: () => this.submitCheckboxes(container)
            });
            container.appendChild(submitButton);
        }

        return container;
    }

    /**
     * Create two-tier button layout
     */
    createTwoTierButtons(buttons, container) {
        const tier1 = buttons.filter(b => b.buttonType === 'primary');
        const tier2 = buttons.filter(b => b.buttonType !== 'primary');

        if (tier1.length > 0) {
            const tier1Container = document.createElement('div');
            tier1Container.className = 'tier-1-buttons';
            
            tier1.forEach(buttonConfig => {
                const button = this.createButton({
                    ...buttonConfig,
                    type: this.buttonTypes.PRIMARY,
                    size: this.buttonSizes.LARGE
                });
                tier1Container.appendChild(button);
            });
            
            container.appendChild(tier1Container);
        }

        if (tier2.length > 0) {
            const tier2Container = document.createElement('div');
            tier2Container.className = 'tier-2-options';
            
            tier2.forEach(buttonConfig => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'alternative-option';
                optionDiv.innerHTML = `
                    <span style="color: #666; font-size: 14px;">${buttonConfig.prefix || 'Or'}</span>
                    <span style="color: #007bff; font-size: 14px; font-weight: 500; cursor: pointer;" 
                          onclick="${buttonConfig.onClick || `handlePillClick('${buttonConfig.action}')`}">
                        ${buttonConfig.text}
                    </span>
                `;
                tier2Container.appendChild(optionDiv);
            });
            
            container.appendChild(tier2Container);
        }

        return container;
    }

    /**
     * Get button type for style
     */
    getTypeForStyle(style) {
        const styleTypeMap = {
            pills: this.buttonTypes.PILL,
            radio: this.buttonTypes.RADIO,
            checkbox: this.buttonTypes.CHECKBOX,
            wizard: this.buttonTypes.PRIMARY
        };

        return styleTypeMap[style] || this.buttonTypes.PILL;
    }

    /**
     * Handle radio button click
     */
    handleRadioClick(button) {
        // Remove selected state from siblings
        const container = button.parentElement;
        container.querySelectorAll('.radio-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selected state to clicked button
        button.classList.add('selected');
    }

    /**
     * Handle checkbox button click
     */
    handleCheckboxClick(button) {
        button.classList.toggle('checked');
    }

    /**
     * Submit checkbox selections
     */
    submitCheckboxes(container) {
        const checked = container.querySelectorAll('.checkbox-btn.checked');
        const actions = Array.from(checked).map(btn => btn.getAttribute('data-action'));
        
        if (typeof handleCheckboxSubmit === 'function') {
            handleCheckboxSubmit(actions);
        }
    }

    /**
     * Update button state
     */
    updateButtonState(button, state, options = {}) {
        const states = Object.values(this.buttonStates);
        
        // Remove all state classes
        states.forEach(s => button.classList.remove(s));
        
        // Add new state
        button.classList.add(state);

        // Handle specific states
        switch (state) {
            case this.buttonStates.LOADING:
                button.disabled = true;
                const originalText = button.querySelector('.button-text')?.textContent || button.textContent;
                button.setAttribute('data-original-text', originalText);
                button.innerHTML = this.createButtonContent({
                    text: options.loadingText || 'Loading...',
                    loading: true
                });
                break;
                
            case this.buttonStates.DISABLED:
                button.disabled = true;
                break;
                
            case this.buttonStates.DEFAULT:
                button.disabled = false;
                const savedText = button.getAttribute('data-original-text');
                if (savedText) {
                    button.querySelector('.button-text').textContent = savedText;
                    button.removeAttribute('data-original-text');
                }
                break;
        }
    }

    /**
     * Create floating action button
     */
    createFloatingButton(config) {
        const button = this.createButton({
            ...config,
            type: this.buttonTypes.FLOATING,
            className: 'floating-action-button ' + (config.className || '')
        });

        // Add floating button specific features
        if (config.badge) {
            const badge = document.createElement('span');
            badge.className = 'button-badge';
            badge.textContent = config.badge;
            button.appendChild(badge);
        }

        return button;
    }

    /**
     * Animate button click
     */
    animateClick(button) {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 300);
    }
}

// Create global instance
window.buttonStrategy = new ButtonStrategy();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ButtonStrategy;
}