// Test script for drum-only functionality
// Run this in the browser console to test the MusicGen integration

class DrumTest {
    constructor() {
        this.testResults = [];
    }

    async runTests() {
        console.log('🥁 Starting Drum Functionality Tests...\n');

        // Test 1: Check if MusicGen integration is loaded
        await this.testMusicGenLoaded();

        // Test 2: Check drum instrument selection
        await this.testDrumSelection();

        // Test 3: Check drum-specific prompt
        await this.testDrumPrompt();

        // Test 4: Check UI indicators
        await this.testDrumUI();

        // Test 5: Check server connection
        await this.testServerConnection();

        // Display results
        this.displayResults();
    }

    async testMusicGenLoaded() {
        try {
            if (typeof window.musicGenIntegration !== 'undefined') {
                this.testResults.push({ test: 'MusicGen Integration Loaded', status: 'PASS', details: 'Integration class found' });
            } else {
                this.testResults.push({ test: 'MusicGen Integration Loaded', status: 'FAIL', details: 'Integration class not found' });
            }
        } catch (error) {
            this.testResults.push({ test: 'MusicGen Integration Loaded', status: 'ERROR', details: error.message });
        }
    }

    async testDrumSelection() {
        try {
            if (typeof window.musicGenIntegration !== 'undefined') {
                // Test drum selection
                window.musicGenIntegration.selectInstrument('drums');
                
                if (window.musicGenIntegration.currentInstrument === 'drums') {
                    this.testResults.push({ test: 'Drum Selection', status: 'PASS', details: 'Successfully selected drums' });
                } else {
                    this.testResults.push({ test: 'Drum Selection', status: 'FAIL', details: 'Failed to select drums' });
                }
            } else {
                this.testResults.push({ test: 'Drum Selection', status: 'SKIP', details: 'Integration not loaded' });
            }
        } catch (error) {
            this.testResults.push({ test: 'Drum Selection', status: 'ERROR', details: error.message });
        }
    }

    async testDrumPrompt() {
        try {
            if (typeof window.musicGenIntegration !== 'undefined') {
                const prompt = window.musicGenIntegration.createMusicGenPrompt();
                
                if (prompt.includes('ONLY') && prompt.includes('drum') && prompt.includes('NO other instruments')) {
                    this.testResults.push({ test: 'Drum Prompt', status: 'PASS', details: 'Drum-only prompt correctly generated' });
                } else {
                    this.testResults.push({ test: 'Drum Prompt', status: 'FAIL', details: 'Drum prompt not specific enough' });
                }
            } else {
                this.testResults.push({ test: 'Drum Prompt', status: 'SKIP', details: 'Integration not loaded' });
            }
        } catch (error) {
            this.testResults.push({ test: 'Drum Prompt', status: 'ERROR', details: error.message });
        }
    }

    async testDrumUI() {
        try {
            const drumButton = document.querySelector('[data-instrument="drums"]');
            if (drumButton) {
                // Check if drum button has special styling
                if (drumButton.classList.contains('drum-only')) {
                    this.testResults.push({ test: 'Drum UI Styling', status: 'PASS', details: 'Drum button has special styling' });
                } else {
                    this.testResults.push({ test: 'Drum UI Styling', status: 'FAIL', details: 'Drum button missing special styling' });
                }
            } else {
                this.testResults.push({ test: 'Drum UI Styling', status: 'FAIL', details: 'Drum button not found' });
            }
        } catch (error) {
            this.testResults.push({ test: 'Drum UI Styling', status: 'ERROR', details: error.message });
        }
    }

    async testServerConnection() {
        try {
            const response = await fetch('http://localhost:3001/health');
            if (response.ok) {
                this.testResults.push({ test: 'Server Connection', status: 'PASS', details: 'Server is running and accessible' });
            } else {
                this.testResults.push({ test: 'Server Connection', status: 'FAIL', details: `Server returned ${response.status}` });
            }
        } catch (error) {
            this.testResults.push({ test: 'Server Connection', status: 'FAIL', details: 'Server not accessible - make sure to run "npm start"' });
        }
    }

    displayResults() {
        console.log('\n📊 Test Results:');
        console.log('================');
        
        let passCount = 0;
        let failCount = 0;
        let errorCount = 0;
        let skipCount = 0;

        this.testResults.forEach(result => {
            const status = result.status;
            const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'ERROR' ? '⚠️' : '⏭️';
            
            console.log(`${icon} ${result.test}: ${status}`);
            console.log(`   ${result.details}\n`);

            if (status === 'PASS') passCount++;
            else if (status === 'FAIL') failCount++;
            else if (status === 'ERROR') errorCount++;
            else if (status === 'SKIP') skipCount++;
        });

        console.log('📈 Summary:');
        console.log(`✅ Passed: ${passCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`⚠️  Errors: ${errorCount}`);
        console.log(`⏭️  Skipped: ${skipCount}`);

        if (failCount === 0 && errorCount === 0) {
            console.log('\n🎉 All tests passed! Drum functionality is working correctly.');
        } else {
            console.log('\n🔧 Some tests failed. Check the details above and fix any issues.');
        }
    }
}

// Auto-run tests when script loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const drumTest = new DrumTest();
        drumTest.runTests();
    }, 2000); // Wait 2 seconds for everything to load
});

// Manual test runner
window.runDrumTests = () => {
    const drumTest = new DrumTest();
    drumTest.runTests();
};

console.log('🥁 Drum Test Script Loaded');
console.log('Run "runDrumTests()" in console to test manually');
