const express = require('express');
const bodyParser = require('body-parser');

const { Builder, By } = require('selenium-webdriver');
const SeleniumStealth = require('selenium-stealth');
const app = express();
const port = 2000;
//const __dirName = "C:/Users/ACER/Desktop/PRECIOUS/pages/yahooCookiePage/pages";


// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


// Serve the HTML page with the form
app.get('/', (req, res) => {
    //res.sendFile(__dirName+'/index.html');
    const path = require('path');
    res.sendFile('index.html', { root: path.join(__dirname, 'pages') }); 
 });

 // Handle form submission
app.post('/submit', async (req, res) => {
    const { em } = req.body;
  
    // Start Selenium WebDriver
    //let driver = await new Builder().forBrowser('chrome').build();
    
    //stealth START
    const driver = new Builder()
    .withCapabilities({
        'goog:chromeOptions': {
            excludeSwitches: [
                'enable-automation',
                'useAutomationExtension',
            ],
        },
    })
    .forBrowser('chrome')
    .build();

    const seleniumStealth = new SeleniumStealth(driver)
    await seleniumStealth.stealth({
        languages: ["en-US", "en"],
        vendor: "Google Inc.",
        platform: "Win32",
        webglVendor: "Intel Inc.",
        renderer: "Intel Iris OpenGL Engine",
        fixHairline: true
    })
  
    try {
      // Navigate to the website and perform actions
      await driver.get('https://login.yahoo.com'); // Replace with your target website
      await driver.findElement(By.id('login-username')).sendKeys(em); // Adjust the selector
      await driver.sleep(300);
    //  await driver.findElement(By.name('searchField2')).sendKeys(keyword2); // Adjust the selector
      await driver.findElement(By.id('login-signin')).click(); // Adjust the selector
      await driver.sleep(300);
    
       // Wait for 300 milliseconds
     // Wait for either the error element to be located or the URL to change
     await driver.sleep(5000);


     await driver.wait(async () => {
     
      const errorElement = await driver.findElements(By.id('username-error'));
      //const errorElement = await driver.findElements(By.id('username-error'));Prove you're not a robot
      
      const currentUrl = await driver.getCurrentUrl();

     if (errorElement.length > 0) {
      let err =  await errorElement[0].getText();
          res.status(202).send(err); 
          console.log('Error element found:'+err);
          
          return true;
      }else if (currentUrl !== 'https://login.yahoo.com/') { // replace with your page URL
      res.status(202).send('Redirected'); 
          console.log('Redirected');
          return true;
      }
      //return false;
  }, 10000); 
  
      // Simple response to acknowledge completion
    } finally {
      //await driver.quit();
    }
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });