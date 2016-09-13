$(document).ready(function () {
    
    // ================================= Core Functions ===============================

    function scrollDown () {
        var objDiv = document.getElementById("gameDisplay");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    Array.prototype.remove = function (x) {
        var i;
        for (i in this) {
            if (this[i].toString() == x.toString()) {
                this.splice(i, 1)
            }
        }
    }

    // ================================= GAME VARIABLES ===============================

    var input               = $('#gameInputTxt'),
        output              = $('#gameCommand'),         // Use output.before(text) to send message
        HP                  = $('#gamePlayerHP'),
        Attack              = $('#gamePlayerAttack'),
        gameInfo            = $('#gameInfo'),
        room                = null,
        previousRoom        = null,
        roomText            = $('#gameRoom'),
        actions             = 0,
        isNight             = true,
        inRiddle            = false,
        riddleFunction      = null,
        allowedMasterCmd    = false,
        isGameOver          = false;


    // ===================================== ITEMS ====================================

    var knife = {
        name: "Small Kitchen Knife",
        specialDesc: "A small <b>kitchen knife</b> lies on a table next to the man.",
        attack: 1
    };

    var darkroomKey = {
        name: "Small Black Key"
    };

    var machete = {
        name: "Machete",
        specialDesc: "A machete is handing on the wall.",
        attack: 4
    };

    var bedroomKey = {
        name: "Bedroom Key"
    };

    var carKey = {
        name: "Car Key"
    };
    
    var tvRemote = {
        name: "TV Remote",
        specialDesc: "A TV remote sits on a table behind the little boy."
    };

    var officeCode = {
        name: "Office Door Code"
    };

    var guestFob = {
        name: "Guest Door Fob",
        specialDesc: "There is a door fob handing next to the door.",
    };

    var sword = {
        name: "Samurai Sword",
        attack: 7
    };

    var dummy = {
        name: "Dummy",
        specialDesc: "There is a dummy on a shelf in the corner."
    };

    // ========================= ROOMS AND CUSTOM COMMANDS =========================

    // Functions
    var rooms = function (name, look, help, items, commands, onEnter) {
        this.name = name;
        this.look = look;
        this.help = help;
        this.items = items;
        this.commands = commands;
        this.onEnter = onEnter;
        this.visited = false;
    };

    rooms.prototype.addExit = function (direction, exit, onChange) {
        switch (direction) {
            case "north":
                this.north = exit;
                this.onNorth = onChange;
                break;
            case "east":
                this.east = exit;
                this.onEast = onChange;
                break;
            case "south":
                this.south = exit;
                this.onSouth = onChange;
                break;
            case "west":
                this.west = exit;
                this.onWest = onChange;
                break;
            case "up":
                this.up = exit;
                this.onUp = onChange;
                break;
            case "down":
                this.down = exit;
                this.onDown = onChange;
                break;
        }
    };


    // ==== HOUSE 1 ====
    // ==== Entrance ====

    var entrance = new rooms(
        "Entrance",
        "You wake up in a room with and old <b>man</b> sat on a chair in the corner reading a <b>book</b>, there is one door to the <b>west</b>.",
        "You can <b>pickup</b> and <b>use</b> objects, you can also <b>talk to</b> people.",
        [knife],
        [
            [
                ['take knife', 'take kitchen knife', 'pickup knife', 'pickup kitchen knife', 'pick up knife'],
                function () {
                    return pickup(knife, entrance, "You picked up the knife from the table (you feel stronger).");
                }
            ],
            [
                ['talk to man', 'talk to old man'],
                function () {
                    return sendMessage("<strong>Old Man:</strong> IT'S USING DEV NOT LIVE!");
                }
            ],
            [
                ['look at book'],
                function () {
                    return sendMessage("You look at the title of the book the old man is reading... 'Transformation for Dummies'");
                }
            ],
            [
                ['kill man', 'kill old man', 'stab man', 'kill man with knife', 'use knife'],
                function () {
                    if ($.inArray(knife, player.inventory) > -1 && player.attack == 2) {
                        sendMessage("You go to stab the old man in the chest with your knife, however just before you hit he grabs the knife and throws it across the room.<br />The old man then stands up and begins to transform into a huge devil that fills most of the room, before you know it he picks you up and crushes you in his hand.");

                        // Kill Player
                        player.HP = 0;
                        setHP(player.HP);

                        isGameOver = true;
                        sendMessage("You Died!");
                        sendMessage("GAME OVER");
                    } else if (player.attack > 2 && player.attack < 7) {
                        sendMessage("You attack the man however just before you hit he grabs your weapon and throws it across the room.<br />The old man then stands up and begins to transform into a huge devil that fills most of the room, before you know it he picks you up and crushes you in his hand.");

                        // Kill Player
                        player.HP = 0;
                        setHP(player.HP);

                        isGameOver = true;
                        sendMessage("You Died!");
                        sendMessage("GAME OVER");
                    } else if (player.attack >= 7) {
                        sendMessage("You swing your weapon at the old man, the old man goes the grab your weapon but when he does it cuts his hand straight off.");
                        sendMessage("The old man rises to his feet and pushed you with great force accross the room.")

                        player.HP -= 4;
                        if (player.HP <= 0) {
                            // dead
                            player.HP = 0;
                            setHP(player.HP);
                            isGameOver = true;
                            sendMessage("You Died!");
                            sendMessage("GAME OVER");
                        } else {
                            setHP(player.HP);

                            sendMessage("You begin to stand and as you do the old man starts to transform, however before his transform is complete you run at him and stab him straight through the heart.");
                            sendMessage("The old man screens then bursts into ashes.");

                            sendMessage("<br /><br />After you feel a ray of light shine over you as if all the evil is now gone.");

                            isGameOver = true;
                            sendMessage("The Devil is Dead!");
                            sendMessage("YOU WIN!");
                        }
                    } else {
                        sendMessage("How can you kill the man without a weapon?");
                    }
                }
            ]
        ]
    );

    

    // ==== First Corridor ====

    var firstCorridor = new rooms(
        "Corridor",
        "You enter a long dark corridor there is a door to the <b>south</b> and a light in the distance to the <b>north</b>",
        "Nothing to do here."
    );
    entrance.addExit("west", firstCorridor);
    firstCorridor.addExit("east", entrance);
    

    // ==== Kitchen ====

    var kitchen_chefDead = false;
    var kitchen = new rooms(
        "Kitchen",
        "You enter a kitchen, there is a man that looks like a <b>chef</b> standing next to what looks like a <b>pot</b> of stew.",
        "Remember you can interact with people an objects (<b>talk to</b>, <b>look at</b>)",
        [darkroomKey],
        [
            [
                ['talk to chef'],
                function () {
                    if (!kitchen_chefDead) {
                        if ($.inArray(knife, player.inventory) > -1) {
                            sendMessage("<strong>Chef:</strong> You have found my knife thanks so much, here take this to show my thanks.");

                            // Remove Knife
                            player.inventory.remove(knife);
                            player.attack -= knife.attack;
                            setAttack(player.attack);

                            // Get Key
                            pickup(darkroomKey, kitchen, "The chef gives you a " + darkroomKey.name);
                        } else if ($.inArray(darkroomKey, player.inventory) > -1) { // Already have key
                            sendMessage("<strong>Chef:</strong> Sorry I'm busy.");
                        } else {
                            sendMessage("<strong>Chef:</strong> Can't you see I'm busy, I'm trying to find my knife leave me alone.")
                        }
                    } else {
                        sendMessage("I'm not sure he will say much he is dead.");
                    }
                }
            ],
            [
                ['kill chef', 'stab chef'],
                function () {
                    if (!kitchen_chefDead) {
                        if ($.inArray(knife, player.inventory) > -1) {
                            sendMessage("You swing at the chef and cut him across the face.");
                            sendMessage("<strong>Chef:</strong> What the hell, your pay for that.");
                            sendMessage("The chef grabs a large wooden sppoon from the counter and hits you across the face.");

                            player.HP -= 2;
                            setHP(player.HP);

                            sendMessage("You then take your knife and stab it directly into the chefs heart.");
                            sendMessage("<strong>Chef:</strong> No matter.. your.. never make it.. out.. the... ho.u.s......");
                            kitchen_chefDead = true;

                            sendMessage("<br />Standing over the chefs dead body you notice a key around his neck.");
                            pickup(darkroomKey, kitchen, "You take the key");
                        } else if (player.attack > 3) {
                            sendMessage("You swing your weapon at the chef and cut his head clean from his body, he drops to the floor.");
                        } else {
                            sendMessage("How will you do that?");
                        }
                    } else {
                        sendMessage("There is no need, he is already dead.");
                    }
                }
            ],
            [
                ['look at pot', 'look in pot', 'look at stew'],
                function () {
                    sendMessage("You take a closer look into the pot of stew after a couple of seconds you notice a severed finger and a eyeball pop out of the stew, you slowly backaway.");
                }
            ],
            [
                ['pickup pot', 'pick up pot', 'take pot'],
                function () {
                    if (!kitchen_chefDead) {
                        sendMessage("<strong>Chef:</strong> Oi! leave my stew alone I need to get it ready for the boss.");
                    } else {
                        sendMessage("I'm not sure you can carry that around.");
                    }
                }
            ]
        ]
    );
    firstCorridor.addExit("north", kitchen);
    kitchen.addExit("south", firstCorridor);


    // ==== Dark Room ====
    
    var darkroom_doorLocked = true;
    var darkroom_lightOn = false;
    var darkroom = new rooms(
        "Dark Room",
        "You enter a room so dark you can see anything, the only <b>light</b> is from the kitchen from across the corridor.",
        "You need to find a <b>light</b> (or <b>switch</b>)",
        [],
        [
            [
                ['find light', 'find switch', 'find a light', 'find a switch', 'find light switch'],
                function () {
                    sendMessage("You feel around in the dark checking the walls you find a small switch, after switching the room lights flicker on.");
                    darkroom_lightOn = true;

                    darkroom.addExit("up", upstairsCorridor);
                    darkroom.addExit("south", frontHallway);
                    darkroom.addExit("west", secondCorridor);

                    sendMessage("With the lights on you notice there are doors to the <b>west</b> and <b>south</b>, there are some stairs going <b>up</b>.");
                }
            ],
            [
                ['help'],
                function () {
                    // Custom help for darkroom
                    if (darkroom_lightOn) {
                        sendMessage("HELP");
                        sendMessage("Nothing to do here.");
                    } else {
                        sendMessage("HELP");
                        sendMessage(darkroom.help);
                    }
                }
            ]            
        ]
    );
    
    firstCorridor.addExit("south", darkroom, [function () {
        if ($.inArray(darkroomKey, player.inventory) > -1 && darkroom_doorLocked) {
            sendMessage("You use the " + darkroomKey.name + " and the door unlocks.");
            darkroom_doorLocked = false;
            return true;
        } else if (!darkroom_doorLocked) {
            return true; // Door is already open
        } else {
            sendMessage("You try to open the door but it seems to be locked");
            return false;
        }
    }]);
    darkroom.addExit("north", firstCorridor);

    var upstairsCorridor = new rooms(
        "Upstairs Corridor",
        "Once you reach the top of the stairs you notice one room to the <b>north</b>",
        "Nothing to do here");
    upstairsCorridor.addExit("down", darkroom);

    var bedroom_doorLocked = false;
    var bedroom = new rooms(
        "Beadroom",
        "You enter a dark room with a faint light in the corner next to a dirty tattered <b>bed</b>.<br />As you look back at the exit you notice a small <b>lock</b> on the door but the <b>key</b> is missing.",
        "You can <b>use</b> objects and items, also try to <b>look out</b> the window",
        [],
        [
            [
                ['sleep', 'go to sleep', 'use bed', 'go to bed', 'go bed'],
                function () {
                    if (isNight) {
                        if (bedroom_doorLocked) {
                            // Sleep through night
                            sendMessage("You lay on the bed and fall asleep.");
                            sendMessage("During the night you are woken by the noise of the bedroom door handle rattling, It sounds like someone trying to get in.");
                            sendMessage("After what seems like 5 mins the rattling stops and you fall back to sleep.");
                            sendMessage("<br />");
                            isNight = false;

                            sendMessage("You wakeup noticing sunlight from the nearby window, you get out of bed and unlock the bedroom door.");
                            bedroom_doorLocked = false;
                        } else {
                            sendMessage("You lay on the bed and fall asleep.");
                            sendMessage("During your sleep the bedroom door opens, a large black creature runs at you through the door and slices your head clean off.");

                            // Kill Player
                            player.HP = 0;
                            setHP(player.HP);

                            isGameOver = true;
                            sendMessage("You Died!");
                            sendMessage("GAME OVER");
                        }
                    } else {
                        sendMessage("No need to sleep it's daytime.");
                    }
                }
            ],
            [
                ['look out', 'look out window', 'look out the window'],
                function () {
                    if (isNight) {
                        sendMessage("You look out the window but you don't see anything because it's too dark outside.");
                    } else {
                        sendMessage("You look out the window, outside you can see another house and also what looks like a office block.");
                    }
                }
            ],
            [
                ['use key', 'lock door'],
                function () {
                    if (bedroom_doorLocked) {
                        sendMessage("The door is already locked.")
                    } else {
                        if ($.inArray(bedroomKey, player.inventory) > -1) {
                            sendMessage("You use the key you found in the basement to lock the door, it works perfectly.")
                            bedroom_doorLocked = true;
                        } else {
                            if ($.inArray(darkroomKey, player.inventory) > -1) {
                                sendMessage("You try to use the " + darkroomKey.name + " on the door but it dosn't work.");
                            } else {
                                sendMessage("You have no key to lock the door with.");
                            }
                        }
                    }
                }
            ]
        ]
    );
    upstairsCorridor.addExit("north", bedroom);
    bedroom.addExit("south", upstairsCorridor);

    var frontHallway = new rooms(
        "House Front", 
        "You ender a small hallway, you can see a door to the <b>south</b> with a small <b>window</b> in it.", 
        "Try to <b>look out</b> the window",
        [],
        [
            [
                ['look out window', 'look out the window', 'look through door', 'use window'],
                function () {
                    if (isNight) {
                        sendMessage("You look out the window it's dark outside.  You can barly make out 2 buildings outside you also make out a large black figure crouched in the distance.");
                    } else {
                        sendMessage("You look out the window the sun is shining, outside you can see another house and also what looks like a office block.");
                    }
                }
            ]
        ]
    );
    frontHallway.addExit("north", darkroom);

   var secondCorridor = new rooms(
        "Corridor", 
        "You enter a dark corridor there are no other directions appart from the way you came but you do notice some stairs which go <b>down</b>.", 
        "Nothing to do here"
    );
    secondCorridor.addExit("east", darkroom);

    var basement = new rooms(
        "Basement", 
        "You enter a dark basement the only light being from flickering candles hanging from the roof.<br />As you look around you jump back as you notice loads of dead <b>bodies</b> handing from hooks.<br />One of the bodies hanging has his <b>hand</b> clenched tightly.", 
        "Remember you can interact with objects (<b>pickup</b>, <b>look at</b> and <b>use</b>).",
        [machete, bedroomKey],
        [
            [
                ['take machete', 'pickup machete', 'pick up machete'],
                function () {
                    pickup(machete, basement, "You take the machete off the wall (you feel stronger).");
                }
            ],
            [
                ['look at hand', 'open hand'],
                function () {
                    sendMessage("You take a closer look at the hand, it seems like it's holding something");
                    sendMessage("You try to open the hand but it's clenched tight.");
                }
            ],
            [
                ['look at bodies'],
                function () {
                    sendMessage("You take a closer look at the hanging bodies, Some look like they have dies recently where overs look like they are rotting away.");
                }
            ],
            [
                ['cut hand', 'cut off hand', 'use machete on hand'],
                function () {
                    if ($.inArray(machete, player.inventory) > -1) {
                        sendMessage("You slice the clenched hand clean off, as it hits the floor you notice the fingers slowly open and you notice a key inside.");
                        pickup(bedroomKey, basement, "You pickup the key.");
                    } else {
                        sendMessage("How can you do this?");
                    }
                }
            ]
        ]
    );
    secondCorridor.addExit("down", basement);
    basement.addExit("up", secondCorridor);


    // ==== Outside ====

    var outside = new rooms(
        "Outside", 
        "You walk outside the glare from the sun makes you rub your eyes. <br />You then notice all the things around you, to the <b>east</b> there is another house and to the <b>south</b> there is a tall office block like building.<br />You continue to look around and notice a car stopped in the middle of the road to the <b>west</b>, it looks very similar to your <b>car</b>.", 
        "Remember you can interact with objects (<b>look at</b>).",
        [],
        [
            [
                ['look at car', 'go to car'],
                function () {
                    if ($.inArray(carKey, player.inventory) > -1) {
                        sendMessage("You walk up to the car and using the car keys you unlock it.");
                        sendMessage("Swiftly you start the engine and speed away never to come back.<br /><br />");

                        sendMessage("<br />You have escaped.<br />You WIN!");
                        isGameOver = true;
                    } else {
                        sendMessage("You walk up to the car and take a closer look, after closer inspection you notice that it attualy is your car.");
                        sendMessage("You try to open the car but it's locked.");
                    }
                }
            ],
            [
                ['unlock car', 'use car key', 'use key on car'],
                function () {
                    if ($.inArray(carKey, player.inventory) > -1) {
                        sendMessage("You walk up to the car and using the car keys you unlock it.");
                        sendMessage("Swiftly you start the engine and speed away never to come back.<br /><br />");

                        sendMessage("<br />You have escaped.<br />You WIN!");
                        isGameOver = true;
                    } else {
                        sendMessage("You don't have the keys for the car.");
                    }
                }
            ],
            [
                ['run away', 'escape'],
                function () {
                    sendMessage("There isn't much point, I don't think your get very far running.");
                }
            ]
        ]
    );
    frontHallway.addExit("south", outside, [function () {
        if (isNight) {
            sendMessage("As you walk outside the door of the house behind you slams shut, you then notice a large black figure in the distance.");
            sendMessage("The dark figure charges at you and before you can react slashes you with claw like hands across your neck.<br />");
            
            // Kill Player
            player.HP = 0;
            setHP(player.HP);

            isGameOver = true;
            sendMessage("You Died!");
            sendMessage("GAME OVER");

            return false;
        } else {
            return true;
        }
    }]);


    // ==== House 2 ====

    var house2Hallway = new rooms(
        "House Front",
        "You enter the house even though it's sunny ourside it's very dark inside you can just about see a room to the <b>east</b>.  There is also some stairs going <b>up</b>.",
        "Nothing to do here"
    );
    outside.addExit("east", house2Hallway);
    house2Hallway.addExit("west", outside);

    var livingRoom = new rooms(
        "Living Room",
        "When you enter the room you notice the flickering of the <b>tv</b>, then you notice a little <b>boy</b> standing in front of the tv.  He looks at you as you enter then swiftly continues looking at the tv.",
        "Remember you can interact with object (<b>look at</b>, <b>talk to</b>, <b>switch off</b>).",
        [tvRemote, carKey],
        [
            [
                ['talk to boy'],
                function () {
                    sendMessage("You try to talk to the boy. The boy raises his arm and points at the TV.");
                    sendMessage("<strong>Little Boy:</strong> Eh!");
                }
            ],
            [
                ['turn off tv', 'switch off tv'],
                function () {
                    sendMessage("You switch the TV off, as you do the little boy looks at you.  After a couple of seconds the boy lets out a screaming cry.");
                    sendMessage("As he does you hear a huge BANG! coming from the direction of the front door.");
                    sendMessage("You look back and see a huge black figure standing in the doorway, the moment you see turn it charges as you and slashes you in two.");

                    // Kill Player
                    player.HP = 0;
                    setHP(player.HP);

                    isGameOver = true;
                    sendMessage("You Died!");
                    sendMessage("GAME OVER");
                }
            ],
            [
                ['use remote'],
                function () {
                    sendMessage("You switch the TV off, as you do the little boy looks at you.  After a couple of seconds the boy lets out a screaming cry.");
                    sendMessage("As he does you hear a huge BANG! coming from the direction of the front door.");
                    sendMessage("You look back and see a huge black figure standing in the doorway, the moment you move it charges as you and slashes you in two.");

                    // Kill Player
                    player.HP = 0;
                    setHP(player.HP);

                    isGameOver = true;
                    sendMessage("You Died!");
                    sendMessage("GAME OVER");
                }
            ],
            [
                ['look at boy'],
                function () {
                    sendMessage("You take a closer look at the little boy and notice he is holding something in is <b>hand</b>.")
                }
            ],
            [
                ['take from boy', 'open boy hand'],
                function () {
                    sendMessage("You try to take the object from the little boys hand, he fights you for it but eventually gives it up.  After a couple of seconds the boy lets out a screaming cry.")
                    sendMessage("As he does you hear a huge BANG! coming from the direction of the front door.");
                    sendMessage("You look back and see a huge black figure standing in the doorway, the moment you move it charges as you and slashes you in two.");

                    // Kill Player
                    player.HP = 0;
                    setHP(player.HP);

                    isGameOver = true;
                    sendMessage("You Died!");
                    sendMessage("GAME OVER");
                }
            ],
            [
                ['kill boy'],
                function () {
                    sendMessage("Why would you do that you monster!")
                }
            ],
            [
                ['pickup remote', 'pick up remote', 'take remote'],
                function () {
                    if ($.inArray(tvRemote, livingRoom.items) > -1) {
                        pickup(tvRemote, livingRoom, "You take the tv remote");
                    } else {
                        sendMessage("You cannot take that.");
                    }
                }
            ],
            [
                ['give boy remote', 'give remote to boy'],
                function () {
                    if ($.inArray(tvRemote, player.inventory) > -1) {
                        sendMessage("You show the remote to the little boy, the boy drops the object he was holding and reaches out for the remote.");
                        sendMessage("After giving the remote to the boy you notice the item he droped was some car keys.");
                        player.inventory.remove(tvRemote);

                        pickup(carKey, livingRoom, "You pickup the car keys");
                    } else {
                        sendMessage("You don't have a remove to give.");
                    }
                }
            ]
        ]
    );
    house2Hallway.addExit("east", livingRoom);
    livingRoom.addExit("west", house2Hallway);
    
    var house2Upstairs = new rooms(
        "Upstairs Corridor",
        "You walk upstairs, once you reach the top you notice a door to the <b>east</b>, the door to the <b>north</b> is open.  Inside the door you see a <b>little girl</b> standing in her cot looking out the door.<br />She points at you and says<br /><strong>Little Girl:</strong> Who ya?",
        "Remember you can <b>talk to</b> people and interact with objects (<b>close door</b>)",
        [],
        [
            [
                ['talk to girl', 'talk to little girl'],
                function () {
                    sendMessage("You talk to the little girl, she just smiles.");
                }
            ],
            [
                ['close door', 'close girl door', 'close girls door', 'shut door'],
                function () {
                    sendMessage("You close the girls door, after a couple of seconds you hear a creak, the little girl has opened the door again and is smiling at you.");
                }
            ],
            [
                ['hold door', 'hold the door', 'hold girl door', ' hold girls door', 'hold door shut'],
                function () {
                    sendMessage("You hold the door shut, after a second you can feel the little girl trying to open the door.");
                    sendMessage("After a few attemps she stops,  then you hear a loud cry.");
                    sendMessage("As she does you hear a huge BANG! coming from the direction of the front door downstairs.");
                    sendMessage("You look down and see a huge black creature running at you.  Before you can react the creature slices your head off and it rolls down the stairs.");

                    // Kill Player
                    player.HP = 0;
                    setHP(player.HP);

                    isGameOver = true;
                    sendMessage("You Died!");
                    sendMessage("GAME OVER");
                }
            ]
        ]
    );
    house2Hallway.addExit("up", house2Upstairs);
    house2Upstairs.addExit("down", house2Hallway);

    var lilyroom_hasDummy = false;
    var lilyRoom = new rooms(
        "Girls Beadroom Room",
        "You enter the girls bedroom, she starts jumping in her cot and smiles at you as you enter.",
        "<strong>Exits:</strong> <b>south</b>",
        [dummy],
        [
            [
                ['take dummy', 'pick up dummy', 'pickup dummy'],
                function () {
                    pickup(dummy, lilyRoom, "You take the dummy from the shelf.");
                }
            ],
            [
                ['give dummy to girl', 'give girl dummy'],
                function () {
                    if ($.inArray(dummy, player.inventory) > -1) {
                        sendMessage("You hand the dummy to the girl, she smiles and quickly puts the dummy upside down in her mouth.");
                        player.inventory.remove(dummy);
                        lilyroom_hasDummy = true;
                    } else {
                        sendMessage("You don't have a dummy to give.");
                    }
                }
            ],
            [
                ['turn dummy round'],
                function () {
                    if (lilyroom_hasDummy) {
                        sendMessage("You turn the dummy round the correct way in the girls mouth, moments after you do she takes the dummy out looks at it then puts it back upside down again.");
                    } else {
                        sendMessage("Bit weird but ok.");
                    }
                }
            ],
            [
                ['take dummy from girl'],
                function () {
                    if (lilyroom_hasDummy) {
                        sendMessage("I wouldn't do that...");
                    } else {
                        sendMessage("She doesn't have one");
                    }
                }
            ]
        ]
    );
    house2Upstairs.addExit("north", lilyRoom);
    lilyRoom.addExit("south", house2Upstairs);

    var homeOffice = new rooms(
        "Home Office",
        "As you enter the room you notice a desk in the corner with a <b>computer</b> that has way to many monitors.  Under the desk you notice a set of <b>drawers</b>",
        "<strong>Exits:</strong> <b>west</b>",
        [officeCode],
        [
            [
                ['check computer', 'use computer'],
                function () {
                    sendMessage("You look at the computer, the only thing of interest is whoever uses this computer seems to google some random inappropriate stuff.")
                }
            ],
            [
                ['check draw', 'check drawers', 'look in draw', 'look in drawers', 'check draws', 'look in draws'],
                function () {
                    sendMessage("You open the draws, as first you don't find anything of interest.  In the last draw you notice a peice of paper with a code on.");
                    pickup(officeCode, homeOffice, "You take the paper");
                }
            ]
        ]
    );
    house2Upstairs.addExit("east", homeOffice, [function () {
        if (lilyroom_hasDummy) {
            return true;
        } else {
            sendMessage("As you enter the room the little girl starts to cry behind you.");
            sendMessage("As she does you hear a huge BANG! coming from the direction of the front door downstairs.");
            sendMessage("You look down and see a huge black creature running at you.  Before you can react the creature slices your head off and it rolls down the stairs.");

            // Kill Player
            player.HP = 0;
            setHP(player.HP);

            isGameOver = true;
            sendMessage("You Died!");
            sendMessage("GAME OVER");
            return false;
        }
    }]);
    homeOffice.addExit("west", house2Upstairs);

    // ==== Office ====

    var reception_stairsLocked = true;
    var reception = new rooms(
        "Reception",
        "You enter the building after the door opens, once you walk in you notice a <b>lift</b> going <b>up</b> and a door <b>south</b> leading to some <b>stairs</b>",
        "<strong>Exits:</strong> <b>north</b>, <b>south</b> and <b>up</b>",
        [],
        [
            [
                ['use lift'],
                function () {
                    go('up');
                }
            ],
            [
                ['use stairs'],
                function () {
                    if (reception_stairsLocked) {
                        sendMessage("The doors to the stairs are locked, seems like the lift is your only option.");
                    } else {
                        go('south');
                    }
                }
            ]
        ]
    );
    outside.addExit("south", reception, [function () {
        if ($.inArray(officeCode, player.inventory) > -1) {
            sendMessage("You enter the office code and the door swings open.");

            return true;
        } else {
            sendMessage("The door is locked and requires a code to enter.");

            return false;
        }
    }]);
    reception.addExit("north", outside);

    var inLift = false;
    var lift = new rooms(
        "Lift",
        "You enter the lift and press the only lit button (floor 3).<br />As the lift moves you notice the lights flickering, the lift dings for floor 3 however the <b>door</b> doesn't open.",
        "You need to find a way to <b>open</b> the door.",
        [],
        [
            [
                ['force open door', 'use machete on door'],
                function () {
                    sendMessage("You wedge your machete in the door and using it like a crowbar you open the door, however just as the door swings open your machete snaps in half.");
                    player.inventory.remove(machete);
                    player.attack -= machete.attack;
                    setAttack(player.attack);

                    sendMessage("You exit the lift onto floor 3.");
                    inLift = false;
                    go("east");
                }
            ]
        ]
    );
    reception.addExit("up", lift, [function() {
        inLift = true;
        return true;
    }]);

    var thirdfloor = new rooms(
        "3rd Floor",
        "As you walk into the 3rd floor you notice a office to the <b>east</b>, you also notice the doors to the stairs to the <b>north</b>.",
        "<strong>Exits:</strong> <b>east</b> <b>north</b> and <b>down</b>"
    );
    reception.addExit("south", thirdfloor, [function () {
        // Use the stairs
        if (reception_stairsLocked) {
            sendMessage("You try to open the door to the stairs but it's locked.");
            return false;
        } else { return true; }        
    }]);
    lift.addExit("east", thirdfloor);
    thirdfloor.addExit("north", reception, [function () {
        if (reception_stairsLocked) {
            sendMessage("You walk down the stairs, as you reach the door at the bottom you try to open it but it's still locked.");
            return false;
        } else {
            sendMessage("You walk down the stairs, as you walk down you notice a trail of blood smeared down the stairs. As you reach the door at the bottom that was previously locked you notice this door is now open.");
            return true;
        }
    }]);
    thirdfloor.addExit("down", reception, [function () {
        sendMessage("You enter the lift and press the button for the ground floor.");
        sendMessage("You hear a big BANG from above and the next second the lift is falling...falling...falling... CRASH!");

        // Kill Player
        player.HP = 0;
        setHP(player.HP);

        isGameOver = true;
        sendMessage("You Died!");
        sendMessage("GAME OVER");
        return false;
    }]);


    var office = new rooms(
        "Office",
        "You enter the office, as you do you notice a small chinese <b>boy</b> sleeping on his keyboard.",
        "<strong>Exits:</strong> <b>west</b><br />Remember you can interact with people and objects (<b>wake</b> <b>talk to</b>).",
        [sword, guestFob],
        [
            [
                ['take guest fob', 'take fob', 'pickup guest fob', 'pick up guest fob', 'pickup fob', 'pick up fob'],
                function () {
                    if ($.inArray(officeCode, player.inventory) > -1) {
                        pickup(guestFob, office, "You take the guest fob.");
                    } else {
                        sendMessage("There is no guest fob (someone must of taken it).");
                    }
                }
            ],
            [
                ['talk to boy', 'wake boy', 'talk to chinese boy', 'wake chinese boy'],
                function () {
                    sendMessage("You poke the sleeping boy.");
                    sendMessage("<strong>You:</strong> HEY, Wake up!");
                    sendMessage("<strong>Chinese Boy</strong> Oh?  Sorry! Sorry!");
                    sendMessage("<strong>Chinese Boy</strong> Thanks for waking me, I should go home really.");
                    sendMessage("<strong>Chinese Boy</strong> Say if you answer my 2 riddles I'll give you a gift.");
                    sendMessage("<br /><strong>Chinese Boy</strong> I have married many women, but have never been married.  Who am I?");
                    inRiddle = true;
                    riddleFunction = function (answer) {
                        if ($.inArray(answer, ['priest', 'a priest']) > -1) {
                            sendMessage("<strong>Chinese Boy</strong> CORRECT!  Next Riddle.");

                            sendMessage("<strong>Chinese Boy</strong> What belongs to you but others use it more than you do?");
                            riddleFunction = function (answer) {
                                if ($.inArray(answer, ['name', 'your name', 'my name']) > -1) {
                                    sendMessage("<strong>Chinese Boy</strong> CORRECT!  Well Done!");
                                    inRiddle = false;

                                    sendMessage("<strong>Chinese Boy</strong> Here I don't need this anymore, you can have it.");
                                    pickup(sword, office, "The boy gives you a " + sword.name);

                                    sendMessage("After giving you the sword the boy walks out the office.");
                                    if ($.inArray(guestFob, office.items) > -1) {
                                        office.items.remove(guestFob);
                                    }

                                    sendMessage("After he leaves you hear a huge screem coming from outside, it gets quieter and quieter.");
                                } else {
                                    sendMessage("<strong>Chinese Boy</strong> WRONG!  Try Again.");
                                }
                            };
                        } else {
                            sendMessage("<strong>Chinese Boy</strong> WRONG!  Try Again.");
                        }
                    };
                }
            ],
            [
                ['kill boy', 'kill chinese boy'],
                function () {
                    sendMessage("You go to attack the chinese boy, as you do he pulls out a large samurai sword and slices you cleanly in two.");
                    sendMessage("<strong>Chinese Boy</strong> OH MY GOOD LORD!");

                    // Kill Player
                    player.HP = 0;
                    setHP(player.HP);

                    isGameOver = true;
                    sendMessage("You Died!");
                    sendMessage("GAME OVER");
                }
            ]
        ]
    );
    thirdfloor.addExit("east", office);
    office.addExit("west", thirdfloor, [function () {
        if ($.inArray(guestFob, player.inventory) > -1) {
            sendMessage("You use the guest fob to open the door.");
            return true;
        } else if ($.inArray(guestFob, office.items) > -1) {
            sendMessage("You use the guest fob hanging near the door to open the door");
            return true;
        } else {
            sendMessage("The guest fob is missing and you don't have it.");
            sendMessage("There is no other way out.");

            sendMessage("<br /><br />Days pass without food or water.")

            // Kill Player
            player.HP = 0;
            setHP(player.HP);

            isGameOver = true;
            sendMessage("You Died (of dehydration)!");
            sendMessage("GAME OVER");
            return false;
        }
    }]);


    // ================================== Player =====================================

    var player = {
        inventory: [],
        location: entrance,
        HP: 10,
        attack: 1
    };
    entrance.visited = true;  // Set to visited because this is the starting room
    setRoom(player.location);
    
    // Set HP
    setHP(player.HP);

    // Set Attack
    setAttack(player.attack);
    
    // ================================= Core Commands =====================================

    function sendMessage (msg) {
        output.before(msg + "<br />");
        scrollDown();
    }

    function invalidCommand () {
       sendMessage("Sorry I don't recognize that command.")
    }

    function setRoom(val) {
        room = val;
        roomText.text(room.name);
        setGameInfo(room);
    }

    function setHP(val) {
        var html = "";
        for (var i = 0; i < val; i++) {
            html += "<i class='fa fa-heart'></i>";
        }
        HP.html(html);
    }

    function setAttack(val) {
        var html = "";
        for (var i = 0; i < val; i++) {
            html += "<i class='fa fa-gavel'></i>";
        }
        Attack.html(html);
    }

    function showItems () {
        var itemList = [];

        if (room.items != undefined) {
            for (var i = 0; i < room.items.length; i++) {
                if (room.items[i].specialDesc) {
                    sendMessage(room.items[i].specialDesc);
                } else {
                    if (room.items[i].desc != undefined)
                        itemList.push(room.items[i].desc);
                }
            }
        }
        
        if (itemList.length === 1) {
            sendMessage("There is a " + itemList[0] + " here.");
        } else if (itemList.length > 1) {
            var str = "";
            for (var i = 0; i < itemList.length; i++) {
                if (!itemList[i + 1]) {
                    str += itemList[i];
                } else {
                    str += itemList[i] + ", ";
                }
            }
            sendMessage("There is a " + str + " here.");
        }
    }

    function myItems() {
        var str = "";
        for (var i = 0; i < player.inventory.length; i++) {
            if (!player.inventory[i + 1]) {
                str += player.inventory[i].name;
            } else {
                str += player.inventory[i].name + ", ";
            }
        }

        // Update if no items
        if (str == "") str = "You have no items.";

        sendMessage("<strong>Your Items:</strong> " + str);
    }

    function pickup(item, thisRoom, message) {
        if ($.inArray(item, thisRoom.items) > -1) {
            // Remove item from room items
            thisRoom.items.remove(item);

            // Add to player inventory
            player.inventory.push(item);

            if (item.attack != undefined) {
                // Modify Attack
                player.attack += item.attack;
                setAttack(player.attack);
            }

            if (item.health != undefined) {
                // Modify Health
                player.HP += item.health;
                setHP(player.HP);
            }
            
            sendMessage(message)
        }
    }

    function look() {
        sendMessage(room.look);

        showItems();
    }

    function go(direction) {
        if (inLift) {
            sendMessage("Your in the lift you cannot go anywhere only wait.");
            return;
        }

        // If player types "go -direction-" this function receives an array as a parameter.
        if (Array.isArray(direction)) {
            if (direction.length == 1) {
                sendMessage("Which direction?");
            } else {
                go(direction[1]);
            }
        } else {
            if (direction == "back")
            {
                if (previousRoom == null) {
                    sendMessage("There is no room to go back too.");
                    return;
                }

                // go back to previous room.
                var curRoom = room;
                setRoom(previousRoom);
                previousRoom = curRoom; // Set the previous room

                sendMessage("<strong>" + room.name + "</strong>");
                showItems();
                
                // Trigger onEnter functions for room
                if (room.onEnter != undefined) {
                    for (var i = 0; i < room.onEnter.length; i++) {
                        var exFunction = room.onEnter[i];
                        exFunction();
                    }
                }

                return;
            }

            if (room[direction] === undefined) {
                sendMessage("You cannot go that way.");
            } else {
                // Trigger onChange (Direction)
                switch (direction) {
                    case "north":
                        if (room.onNorth != undefined) {
                            for (var i = 0; i < room.onNorth.length; i++) {
                                var exFunction = room.onNorth[i];
                                if (!exFunction()) return;
                            }
                        }
                        break;
                    case "east":
                        if (room.onEast != undefined) {
                            for (var i = 0; i < room.onEast.length; i++) {
                                var exFunction = room.onEast[i];
                                if (!exFunction()) return;
                            }
                        }
                        break;
                    case "south":
                        if (room.onSouth != undefined) {
                            for (var i = 0; i < room.onSouth.length; i++) {
                                var exFunction = room.onSouth[i];
                                if (!exFunction()) return;
                            }
                        }
                        break;
                    case "west":
                        if (room.onWest != undefined) {
                            for (var i = 0; i < room.onWest.length; i++) {
                                var exFunction = room.onWest[i];
                                if (!exFunction()) return;
                            }
                        }
                        break;
                    case "up":
                        if (room.onUp != undefined) {
                            for (var i = 0; i < room.onUp.length; i++) {
                                var exFunction = room.onUp[i];
                                if (!exFunction()) return;
                            }
                        }
                        break;
                    case "down":
                        if (room.onDown != undefined) {
                            for (var i = 0; i < room.onDown.length; i++) {
                                var exFunction = room.onDown[i];
                                if (!exFunction()) return;
                            }
                        }
                        break;
                }

                var curRoom = room;
                setRoom(room[direction]);
                previousRoom = curRoom;

                if (room.visited) {
                    sendMessage("<strong>" + room.name + "</strong>");
                    showItems();
                } else {
                    look();
                    room.visited = true;
                }

                // Trigger onEnter functions for room
                if (room.onEnter != undefined) {
                    for (var i = 0; i < room.onEnter.length; i++) {
                        var exFunction = room.onEnter[i];
                        exFunction();
                    }
                }
            }
        }
    }

    function setGameInfo(myRoom) {
        var content = "";

        // Set Room Exits
        content += setExitInfo(myRoom);

        gameInfo.html(content);
    }

    function setExitInfo(myRoom) {
        var content = "<h3>Exits</h3>";

        // Display exits (and names if visited)
        var str = "";

        // North
        if (myRoom.north != undefined) {
            if (myRoom.north.visited != undefined && myRoom.north.visited == true) { str += "<b>north</b> - " + myRoom.north.name; } else { str += "<b>north</b> - Unknown"; }
            str += "<br />";
        }

        // East
        if (myRoom.east != undefined) {
            if (myRoom.east.visited != undefined && myRoom.east.visited == true) { str += "<b>east</b> - " + myRoom.east.name; } else { str += "<b>east</b> - Unknown"; }
            str += "<br />";
        }

        // South
        if (myRoom.south != undefined) {
            if (myRoom.south.visited != undefined && myRoom.south.visited == true) { str += "<b>south</b> - " + myRoom.south.name; } else { str += "<b>south</b> - Unknown"; }
            str += "<br />";
        }

        // West
        if (myRoom.west != undefined) {
            if (myRoom.west.visited != undefined && myRoom.west.visited == true) { str += "<b>west</b> - " + myRoom.west.name; } else { str += "<b>west</b> - Unknown"; }
            str += "<br />";
        }

        // Up
        if (myRoom.up != undefined) {
            if (myRoom.up.visited != undefined && myRoom.up.visited == true) { str += "<b>up</b> - " + myRoom.up.name; } else { str += "<b>up</b> - Unknown"; }
            str += "<br />";
        }

        // Down
        if (myRoom.down != undefined) {
            if (myRoom.down.visited != undefined && myRoom.down.visited == true) { str += "<b>down</b> - " + myRoom.down.name; } else { str += "<b>down</b> - Unknown"; }
            str += "<br />";
        }
        content += str;

        return content;
    }

    function help() {
        // Help Function
        sendMessage("HELP");

        if (room.help != undefined) {
            sendMessage(room.help);
        } else {
            sendMessage("There is no help for this room, but remember you can change room by providing the direction you wish to go.<br />You can also interact with people and objects in multiple ways.");
        }        
    }

    function restart() {
        // Reset Global Vars
        room = null;
        previousRoom = null;
        actions = 0;
        isNight = true;
        inRiddle = false;
        riddleFunction = null;
        isGameOver = false;

        // Reset Room Vars
        kitchen_chefDead = false;
        darkroom_doorLocked = true;
        darkroom_lightOn = false;
        bedroom_doorLocked = false;
        lilyroom_hasDummy = false;
        reception_stairsLocked = true;
        inLift = false;

        // Reset Rooms
        entrance.items = [knife];
        firstCorridor.visited = false;
        kitchen.items = [darkroomKey];
        kitchen.visited = false;
        darkroom.visited = false;
        upstairsCorridor.visited = false;
        bedroom.visited = false;
        frontHallway.visited = false;
        secondCorridor.visited = false;
        basement.visited = false;
        basement.items = [machete, bedroomKey];
        outside.visited = false;
        house2Hallway.visited = false;
        livingRoom.visited = false;
        livingRoom.items = [tvRemote, carKey];
        house2Upstairs.visited = false;
        lilyRoom.visited = false;
        lilyRoom.items = [dummy];
        homeOffice.visited = false;
        homeOffice.items = [officeCode];
        reception.visited = false;
        lift.visited = false;
        thirdfloor.visited = false;
        office.visited = false;
        office.items = [sword, guestFob];

        // Reset Player
        player.inventory = [];
        player.location = entrance;
        player.HP = 10;
        player.attack = 1;

        setRoom(player.location);
        setAttack(player.attack);
        setHP(player.HP);
        look();
    }

    var masterRooms = [];
    masterRooms['entrance'] = entrance;
    masterRooms['firstCorridor'] = firstCorridor;
    masterRooms['kitchen'] = kitchen;
    masterRooms['darkroom'] = darkroom;
    masterRooms['upstairsCorridor'] = upstairsCorridor;
    masterRooms['bedroom'] = bedroom;
    masterRooms['frontHallway'] = frontHallway;
    masterRooms['secondCorridor'] = secondCorridor;
    masterRooms['basement'] = basement;
    masterRooms['outside'] = outside;
    masterRooms['house2Hallway'] = house2Hallway;
    masterRooms['livingRoom'] = livingRoom;
    masterRooms['house2Upstairs'] = house2Upstairs;
    masterRooms['lilyRoom'] = lilyRoom;
    masterRooms['homeOffice'] = homeOffice;
    masterRooms['reception'] = reception;
    masterRooms['lift'] = lift;
    masterRooms['thirdfloor'] = thirdfloor;
    masterRooms['office'] = office;

    var masterItems = [];
    masterItems['knife'] = knife;
    masterItems['darkroomKey'] = darkroomKey;
    masterItems['machete'] = machete;
    masterItems['bedroomKey'] = bedroomKey;
    masterItems['tvRemote'] = tvRemote;
    masterItems['carKey'] = carKey;
    masterItems['dummy'] = dummy;
    masterItems['officeCode'] = officeCode;
    masterItems['sword'] = sword;
    masterItems['guestFob'] = guestFob;

    function parseCommand (command) {
        command = command.toLowerCase();

        if (inRiddle) {
            return riddleFunction(command);
        }

        // Check Room Commands
        if (room.commands != undefined) {
            for (var i = 0; i < room.commands.length; i++) {
                var commandArray = room.commands[i][0];
                var exFunction = room.commands[i][1];

                for (var j = 0; j < commandArray.length; j++) {
                    if (commandArray[j] == command) {
                        return exFunction();
                    }
                }
            }
        }

        if (command == "my items" || command == "inventory" || command == "i") {
            return myItems();
        }

        // Enable master commands
        if (command == "lily archie barnaby") {
            allowedMasterCmd = true;
            sendMessage("Cheat Mode Enabled");
            return;
        }

        if (allowedMasterCmd) {
            // Master Commands
            switch (command) {
                case "set attack":
                    sendMessage("What to set attack too?");
                    inRiddle = true;
                    riddleFunction = function (data) {
                        player.attack = data;
                        setAttack(player.attack);

                        inRiddle = false;
                    };
                    return;
                    break;
                case "set hp":
                    sendMessage("What to set hp too?");
                    inRiddle = true;
                    riddleFunction = function (data) {
                        player.HP = data;
                        setHP = player.HP;

                        inRiddle = false;
                    };
                    return;
                    break;
                case "give item":
                    sendMessage("What item?");
                    inRiddle = true;
                    riddleFunction = function (data) {
                        player.inventory.push(masterItems[data]);

                        inRiddle = false;
                    };
                    return;
                    break;
                case "go to room":
                    sendMessage("What room?");
                    inRiddle = true;
                    riddleFunction = function (data) {
                        setRoom(masterRooms[data]);
                        look();

                        inRiddle = false;
                    };
                    return;
                    break;
            }
        }
        
        // Check Default Commands
        command = command.split(" ");

        switch(command[0]) {
            case "go":
            case "run":
            case "walk":
                go(command);
                break;

            case "north":
            case "n":
                go("north");
                break;

            case "south":
            case "s":
                go("south");
                break;

            case "east":
            case "e":
                go("east");
                break;

            case "west":
            case "w":
                go("west");
                break;

            case "up":
            case "u":
                go("up");
                break;

            case "down":
            case "d":
                go("down");
                break;

            case "look":
                look();
                break;
                
            case "help":
                help();
                break;

            case "restart":
                restart();
                break;

            default:
                invalidCommand();	

        }
    }

    function submitCommand() {
        var command = input.val();
        input.val(''); // Clear input

        if (isGameOver && command != "restart") {
            // Game is over and you must enter restart.
            return sendMessage("<br />The game is over, please refresh your browser to restart the game.")
        }

        if (command != "lily archie barnaby") {
            sendMessage(""); // Space
            sendMessage("> " + command);
            sendMessage(""); // Space
        }
        

        parseCommand(command);
    }

    input.on('keypress', function (event) {
        if (event.which === 13) {
            // Enter Submited
            event.preventDefault();
            submitCommand();
        }
    });

});