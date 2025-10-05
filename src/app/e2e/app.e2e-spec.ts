// import { browser, by, element, ExpectedConditions as EC } from 'protractor';


// describe('Login Page E2E Tests', () => {
//     const serverUrl = 'http://localhost:3000';

//     beforeEach(async () => {
//         await browser.get('/login'); // Adjust if your route is different
//     });

//     it('should login successfully with valid credentials', async () => {
//         // Mock backend by intercepting HTTP requests (using browser.executeScript + Angular HttpClient mock not trivial in Protractor)
//         // So here, this test assumes the backend is running or you should use a mock backend

//         // Fill username and password
//         await element(by.id('username')).sendKeys('testuser');
//         await element(by.id('password')).sendKeys('correct_password');

//         // Click login button
//         await element(by.css('button[type="submit"]')).click();

//         // Wait for navigation to /chat
//         await browser.wait(EC.urlContains('/chat'), 5000, 'Expected to navigate to /chat');

//         // Verify localStorage items (Protractor runs in browser context)
//         const username = await browser.executeScript('return localStorage.getItem("username");');
//         expect(username).toBe('testuser');

//         const valid = await browser.executeScript('return localStorage.getItem("valid");');
//         expect(valid).toBe('true');
//     });

//     it('should show error message with invalid credentials', async () => {
//         // Fill invalid credentials
//         await element(by.id('username')).sendKeys('wronguser');
//         await element(by.id('password')).sendKeys('wrong_password');

//         // Click login button
//         await element(by.css('button[type="submit"]')).click();

//         // Wait for error message to appear
//         const errorMessage = element(by.css('.error-message'));
//         await browser.wait(EC.visibilityOf(errorMessage), 5000, 'Expected error message to be visible');

//         expect(await errorMessage.getText()).toContain('Invalid credentials');

//         // URL should still include /login
//         expect(await browser.getCurrentUrl()).toContain('/login');
//     });

//     it('should not submit if username or password is empty', async () => {
//         // Clear inputs just in case
//         const usernameInput = element(by.id('username'));
//         const passwordInput = element(by.id('password'));
//         await usernameInput.clear();
//         await passwordInput.clear();

//         // Try submitting with empty username
//         await passwordInput.sendKeys('somepassword');
//         await element(by.css('button[type="submit"]')).click();

//         // Check that URL does NOT change (no navigation)
//         await browser.sleep(1000);
//         expect(await browser.getCurrentUrl()).toContain('/login');

//         // Clear password and fill username
//         await passwordInput.clear();
//         await usernameInput.sendKeys('someuser');
//         await element(by.css('button[type="submit"]')).click();

//         await browser.sleep(1000);
//         expect(await browser.getCurrentUrl()).toContain('/login');
//     });
// });
