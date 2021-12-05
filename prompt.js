const prompt = require('prompt-sync')();

const gender = prompt('Are you male or female ? (M - male, F - female): ');

if(gender == 'M' || gender == 'F'){
    console.log(gender);
} else {
    console.log('try again');
}
