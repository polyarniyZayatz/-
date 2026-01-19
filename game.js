// Cluckin' Bell Idle Clicker - Game Logic

// Game Constants
const UPGRADE_COST_MULTIPLIER = 1.15;
const OFFLINE_EARNINGS_MULTIPLIER = 0.5;

// Game State
const gameState = {
    money: 0,
    totalEarned: 0,
    totalClicks: 0,
    clickValue: 1,
    perSecond: 0,
    lastSave: Date.now(),
    soundEnabled: true,
    upgrades: {}
};

// Upgrades Configuration
const upgradesConfig = [
    {
        id: 'cashier',
        name: 'Кассир',
        icon: '👨‍🍳',
        baseCost: 15,
        baseProduction: 0.1,
        description: 'Принимает заказы'
    },
    {
        id: 'fryer',
        name: 'Фритюрница',
        icon: '🍟',
        baseCost: 100,
        baseProduction: 1,
        description: 'Жарит курочку'
    },
    {
        id: 'cook',
        name: 'Повар',
        icon: '👨‍🍳',
        baseCost: 500,
        baseProduction: 5,
        description: 'Готовит бургеры'
    },
    {
        id: 'delivery',
        name: 'Доставка',
        icon: '🛵',
        baseCost: 2000,
        baseProduction: 20,
        description: 'Доставляет заказы'
    },
    {
        id: 'restaurant',
        name: 'Ресторан',
        icon: '🏪',
        baseCost: 10000,
        baseProduction: 100,
        description: 'Новый филиал'
    },
    {
        id: 'factory',
        name: 'Фабрика',
        icon: '🏭',
        baseCost: 50000,
        baseProduction: 500,
        description: 'Производство еды'
    },
    {
        id: 'franchise',
        name: 'Франшиза',
        icon: '🌍',
        baseCost: 250000,
        baseProduction: 2500,
        description: 'Сеть ресторанов'
    },
    {
        id: 'corporation',
        name: 'Корпорация',
        icon: '🏢',
        baseCost: 1000000,
        baseProduction: 10000,
        description: "Cluckin' Bell Corp"
    }
];

// Achievements Configuration
const achievementsConfig = [
    { id: 'click_1', name: 'Первый клик', icon: '👆', condition: () => gameState.totalClicks >= 1 },
    { id: 'click_100', name: '100 кликов', icon: '💯', condition: () => gameState.totalClicks >= 100 },
    { id: 'click_1000', name: '1000 кликов', icon: '🔥', condition: () => gameState.totalClicks >= 1000 },
    { id: 'money_100', name: '$100', icon: '💵', condition: () => gameState.totalEarned >= 100 },
    { id: 'money_1000', name: '$1,000', icon: '💰', condition: () => gameState.totalEarned >= 1000 },
    { id: 'money_10000', name: '$10,000', icon: '🤑', condition: () => gameState.totalEarned >= 10000 },
    { id: 'money_100000', name: '$100,000', icon: '💎', condition: () => gameState.totalEarned >= 100000 },
    { id: 'money_1000000', name: 'Миллионер', icon: '👑', condition: () => gameState.totalEarned >= 1000000 },
    { id: 'upgrade_first', name: 'Первое улучшение', icon: '⬆️', condition: () => getTotalUpgrades() >= 1 },
    { id: 'upgrade_10', name: '10 улучшений', icon: '🚀', condition: () => getTotalUpgrades() >= 10 },
    { id: 'upgrade_50', name: '50 улучшений', icon: '🌟', condition: () => getTotalUpgrades() >= 50 },
    { id: 'persec_10', name: '$10/сек', icon: '⏱️', condition: () => gameState.perSecond >= 10 },
    { id: 'persec_100', name: '$100/сек', icon: '⚡', condition: () => gameState.perSecond >= 100 },
    { id: 'persec_1000', name: '$1000/сек', icon: '🌪️', condition: () => gameState.perSecond >= 1000 },
    { id: 'chicken_master', name: 'Мастер курицы', icon: '🐔', condition: () => gameState.totalEarned >= 10000000 }
];

// Unlocked achievements tracking
let unlockedAchievements = new Set();

// DOM Elements
let moneyDisplay, perSecondDisplay, totalEarnedDisplay, totalClicksDisplay;
let clickValueDisplay, chickenButton, floatingNumbers, upgradesList, achievementsList;

// Initialize game
function init() {
    // Get DOM elements
    moneyDisplay = document.getElementById('money');
    perSecondDisplay = document.getElementById('per-second');
    totalEarnedDisplay = document.getElementById('total-earned');
    totalClicksDisplay = document.getElementById('total-clicks');
    clickValueDisplay = document.getElementById('click-value');
    chickenButton = document.getElementById('chicken-button');
    floatingNumbers = document.getElementById('floating-numbers');
    upgradesList = document.getElementById('upgrades-list');
    achievementsList = document.getElementById('achievements-list');

    // Initialize upgrades in state
    upgradesConfig.forEach(upgrade => {
        gameState.upgrades[upgrade.id] = 0;
    });

    // Load saved game
    loadGame();

    // Setup event listeners
    setupEventListeners();

    // Render initial UI
    renderUpgrades();
    renderAchievements();
    updateDisplay();

    // Start game loop
    setInterval(gameLoop, 100);

    // Auto-save every 30 seconds
    setInterval(saveGame, 30000);

    console.log("🐔 Cluckin' Bell Idle Clicker loaded!");
}

// Setup event listeners
function setupEventListeners() {
    // Chicken click
    chickenButton.addEventListener('click', handleClick);
    chickenButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleClick(e);
    });

    // Control buttons
    document.getElementById('save-btn').addEventListener('click', () => {
        saveGame();
        showNotification('💾 Игра сохранена!');
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm('Вы уверены? Весь прогресс будет потерян!')) {
            resetGame();
            showNotification('🔄 Игра сброшена!');
        }
    });

    document.getElementById('sound-btn').addEventListener('click', () => {
        gameState.soundEnabled = !gameState.soundEnabled;
        document.getElementById('sound-btn').textContent = gameState.soundEnabled ? '🔊 ЗВУК' : '🔇 ЗВУК';
        showNotification(gameState.soundEnabled ? '🔊 Звук включен' : '🔇 Звук выключен');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            handleClick(e);
        }
    });
}

// Handle click on chicken
function handleClick(event) {
    const earned = gameState.clickValue;
    gameState.money += earned;
    gameState.totalEarned += earned;
    gameState.totalClicks++;

    // Create floating number
    createFloatingNumber(earned, event);

    // Play sound
    if (gameState.soundEnabled) {
        playClickSound();
    }

    // Update display
    updateDisplay();

    // Check achievements
    checkAchievements();
}

// Create floating number animation
function createFloatingNumber(value, event) {
    const floatingNum = document.createElement('div');
    floatingNum.className = 'floating-number';
    floatingNum.textContent = `+$${formatNumber(value)}`;

    // Position near click
    const rect = chickenButton.getBoundingClientRect();
    const containerRect = floatingNumbers.getBoundingClientRect();
    
    const x = (rect.left + rect.width / 2 - containerRect.left) + (Math.random() - 0.5) * 100;
    const y = (rect.top - containerRect.top) + Math.random() * 50;

    floatingNum.style.left = `${x}px`;
    floatingNum.style.top = `${y}px`;

    floatingNumbers.appendChild(floatingNum);

    // Remove after animation
    setTimeout(() => {
        floatingNum.remove();
    }, 1500);
}

// Play click sound (synthesized)
function playClickSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800 + Math.random() * 400;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Audio not supported
    }
}

// Game loop - runs every 100ms
function gameLoop() {
    // Add passive income
    const income = gameState.perSecond / 10; // Divide by 10 because loop runs 10 times per second
    if (income > 0) {
        gameState.money += income;
        gameState.totalEarned += income;
    }

    // Update display
    updateDisplay();

    // Check achievements
    checkAchievements();

    // Update upgrade availability
    updateUpgradeAvailability();
}

// Update all displays
function updateDisplay() {
    moneyDisplay.textContent = formatNumber(Math.floor(gameState.money));
    perSecondDisplay.textContent = formatNumber(gameState.perSecond);
    totalEarnedDisplay.textContent = formatNumber(Math.floor(gameState.totalEarned));
    totalClicksDisplay.textContent = formatNumber(gameState.totalClicks);
    clickValueDisplay.textContent = formatNumber(gameState.clickValue);
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(num % 1 === 0 ? 0 : 2);
}

// Calculate upgrade cost
function getUpgradeCost(upgradeId) {
    const config = upgradesConfig.find(u => u.id === upgradeId);
    const owned = gameState.upgrades[upgradeId] || 0;
    return Math.floor(config.baseCost * Math.pow(UPGRADE_COST_MULTIPLIER, owned));
}

// Calculate total production
function calculatePerSecond() {
    let total = 0;
    upgradesConfig.forEach(upgrade => {
        const owned = gameState.upgrades[upgrade.id] || 0;
        total += owned * upgrade.baseProduction;
    });
    return total;
}

// Get total upgrades owned
function getTotalUpgrades() {
    return Object.values(gameState.upgrades).reduce((a, b) => a + b, 0);
}

// Render upgrades list
function renderUpgrades() {
    upgradesList.innerHTML = '';

    upgradesConfig.forEach(upgrade => {
        const cost = getUpgradeCost(upgrade.id);
        const owned = gameState.upgrades[upgrade.id] || 0;
        const canAfford = gameState.money >= cost;

        const upgradeEl = document.createElement('div');
        upgradeEl.className = `upgrade-item ${canAfford ? '' : 'locked'}`;
        upgradeEl.dataset.id = upgrade.id;
        upgradeEl.innerHTML = `
            <div class="upgrade-header">
                <div class="upgrade-icon">${upgrade.icon}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-owned">Куплено: ${owned}</div>
                </div>
            </div>
            <div class="upgrade-details">
                <span class="upgrade-cost">💰 $${formatNumber(cost)}</span>
                <span class="upgrade-production">+$${formatNumber(upgrade.baseProduction)}/сек</span>
            </div>
        `;

        upgradeEl.addEventListener('click', () => buyUpgrade(upgrade.id));
        upgradesList.appendChild(upgradeEl);
    });
}

// Update upgrade availability visually
function updateUpgradeAvailability() {
    upgradesConfig.forEach(upgrade => {
        const cost = getUpgradeCost(upgrade.id);
        const canAfford = gameState.money >= cost;
        const upgradeEl = document.querySelector(`.upgrade-item[data-id="${upgrade.id}"]`);
        
        if (upgradeEl) {
            if (canAfford) {
                upgradeEl.classList.remove('locked');
            } else {
                upgradeEl.classList.add('locked');
            }
            
            // Update cost display
            const costEl = upgradeEl.querySelector('.upgrade-cost');
            if (costEl) {
                costEl.textContent = `💰 $${formatNumber(cost)}`;
            }
            
            // Update owned count
            const ownedEl = upgradeEl.querySelector('.upgrade-owned');
            if (ownedEl) {
                ownedEl.textContent = `Куплено: ${gameState.upgrades[upgrade.id] || 0}`;
            }
        }
    });
}

// Buy upgrade
function buyUpgrade(upgradeId) {
    const cost = getUpgradeCost(upgradeId);
    
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.upgrades[upgradeId] = (gameState.upgrades[upgradeId] || 0) + 1;
        
        // Recalculate per second
        gameState.perSecond = calculatePerSecond();
        
        // Update click value (bonus from upgrades)
        gameState.clickValue = 1 + Math.floor(getTotalUpgrades() / 10);
        
        // Play purchase sound
        if (gameState.soundEnabled) {
            playPurchaseSound();
        }
        
        // Visual feedback
        const upgradeEl = document.querySelector(`.upgrade-item[data-id="${upgradeId}"]`);
        if (upgradeEl) {
            upgradeEl.classList.add('golden-shine');
            setTimeout(() => upgradeEl.classList.remove('golden-shine'), 1000);
        }
        
        updateDisplay();
        checkAchievements();
    }
}

// Play purchase sound
function playPurchaseSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 523.25; // C5
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

        oscillator.start();

        // Second note
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 659.25; // E5
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            osc2.start();
            osc2.stop(audioContext.currentTime + 0.2);
        }, 100);

        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        // Audio not supported
    }
}

// Render achievements
function renderAchievements() {
    achievementsList.innerHTML = '';

    achievementsConfig.forEach(achievement => {
        const isUnlocked = unlockedAchievements.has(achievement.id);
        
        const achieveEl = document.createElement('div');
        achieveEl.className = `achievement ${isUnlocked ? 'unlocked' : ''}`;
        achieveEl.dataset.tooltip = achievement.name;
        achieveEl.textContent = achievement.icon;
        
        achievementsList.appendChild(achieveEl);
    });
}

// Check for new achievements
function checkAchievements() {
    achievementsConfig.forEach(achievement => {
        if (!unlockedAchievements.has(achievement.id) && achievement.condition()) {
            unlockedAchievements.add(achievement.id);
            showNotification(`🏆 Достижение: ${achievement.name}!`);
            
            if (gameState.soundEnabled) {
                playAchievementSound();
            }
            
            renderAchievements();
        }
    });
}

// Play achievement sound
function playAchievementSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
            }, i * 100);
        });
    } catch (e) {
        // Audio not supported
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slide-in 0.5s ease-out reverse';
        setTimeout(() => notification.remove(), 500);
    }, 2500);
}

// Save game
function saveGame() {
    const saveData = {
        money: gameState.money,
        totalEarned: gameState.totalEarned,
        totalClicks: gameState.totalClicks,
        clickValue: gameState.clickValue,
        perSecond: gameState.perSecond,
        upgrades: gameState.upgrades,
        achievements: Array.from(unlockedAchievements),
        soundEnabled: gameState.soundEnabled,
        lastSave: Date.now()
    };
    
    localStorage.setItem('cluckinBellSave', JSON.stringify(saveData));
    console.log('💾 Game saved!');
}

// Load game
function loadGame() {
    const saveData = localStorage.getItem('cluckinBellSave');
    
    if (saveData) {
        try {
            const data = JSON.parse(saveData);
            
            gameState.money = data.money || 0;
            gameState.totalEarned = data.totalEarned || 0;
            gameState.totalClicks = data.totalClicks || 0;
            gameState.clickValue = data.clickValue || 1;
            gameState.perSecond = data.perSecond || 0;
            gameState.upgrades = data.upgrades || {};
            gameState.soundEnabled = data.soundEnabled !== false;
            
            // Load achievements
            if (data.achievements) {
                unlockedAchievements = new Set(data.achievements);
            }
            
            // Calculate offline earnings
            if (data.lastSave) {
                const offlineTime = (Date.now() - data.lastSave) / 1000; // seconds
                const offlineEarnings = Math.floor(gameState.perSecond * offlineTime * OFFLINE_EARNINGS_MULTIPLIER);
                
                if (offlineEarnings > 0) {
                    gameState.money += offlineEarnings;
                    gameState.totalEarned += offlineEarnings;
                    
                    setTimeout(() => {
                        showNotification(`💤 Офлайн заработок: $${formatNumber(offlineEarnings)}!`);
                    }, 1000);
                }
            }
            
            // Update sound button
            if (!gameState.soundEnabled) {
                document.getElementById('sound-btn').textContent = '🔇 ЗВУК';
            }
            
            // Recalculate perSecond in case of changes
            gameState.perSecond = calculatePerSecond();
            
            console.log('📂 Game loaded!');
        } catch (e) {
            console.error('Error loading save:', e);
        }
    }
}

// Reset game
function resetGame() {
    localStorage.removeItem('cluckinBellSave');
    
    gameState.money = 0;
    gameState.totalEarned = 0;
    gameState.totalClicks = 0;
    gameState.clickValue = 1;
    gameState.perSecond = 0;
    
    upgradesConfig.forEach(upgrade => {
        gameState.upgrades[upgrade.id] = 0;
    });
    
    unlockedAchievements = new Set();
    
    renderUpgrades();
    renderAchievements();
    updateDisplay();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
