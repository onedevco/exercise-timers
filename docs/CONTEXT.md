You are going to build a webapp that helps me with my exercises. 
The app allows me to add a series of timers that will operate in sequence.
I will use these for back exercises that I will perform on the floor and I won't be able to see the timers

### Setting up the timers
* I want to be able to add a quantity of timers (eg 3) and a timer length (eg 20 seonds) and it then add them into the list.
* I want to them be able to add more timers to the list
* I want to be able to drag a row up and down the list
* I want to be able to set a value for the gap inbetween each timer (eg 5 seconds)
* I want to name each timer

### Running the timers
* I want to be able to start the timers running and have a visual clock counting down on the active row
* I want to count down the gap timer on the current timer in reverse time
* so if the gap is 5 seconds it should count down the 5 seconds before the timer started
* I want the app to play a ticking sound on the last 5 seconds of the gap before the timer starts
* I want another ticking sound on the last 5 seconds of the timer
* When a row has completed it should become disabled and visually darker

## Future Ideas
* I want to save a particular configuration and give it a name
* I want the app to say the name of each timer outloud during the gap so that I know which exercise to perform

The should be build as a single page webpage that I can save on an iphone. 
Any local storage should use localStorage and indexedDb

If you have any questions please ask them before you start coding and add the answers into the docs/CONTEXT.md file

