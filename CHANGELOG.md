## What's New


**v3.5.0**
* Allowed specifying the full URL in `opts.server` if `opts.port` is not specified.

**v3.4.3**
* Fixed a bug in `Room#sendHTML`.

**v3.4.2**
* Fixed a bug in client typings.

**v3.4.1**
* Added proper split typings to Message for narrowing in TypeScript.

**v3.4.0**
* Added `update` methods to Users and Rooms.
* Restructured type definitions, added JSDoc-style comments, moved Message, User, and Room to root-level imports.

**v3.3.3**
* Added missing type definitions for `Message#msgRank`.

**v3.3.2**
* Addressed a bug in `User#sendHTML`.

**v3.3.1**
* Updated typings on the classes to correctly include all return values and optional fields.

**v3.3.0**
* Added a `Tools#formatText` function to format chat text accordingly!

**v3.2.1**
* Made `Client#on('name')` also emit an isIntro event.

**v3.2.0**
* Added a `noFailMessages` option in config to prevent messages throwing errors; defaults to true.

**v3.1.1**
* Fixed minor lint errors.
* Added Husky to make sure this doesn't happen again.

**v3.1.0**
* Made `Message#privateReply` send a DM to the author if the client does not have permissions to send private HTML in the room.

**v3.0.0**
* Type definitions for all custom events added.
* The 'chaterror' event was renamed to 'chatError' to be in line with other event names.

**v2.1.1**
* Fixed the d.ts files to actually work.
* Moved the changelog to be lower in the README.

**v2.1.0**
* Added in a `Message#msgRank` field for much easier rank parsing.

**v2.0.0**
* I suck and forgot to document this; `rooms` has been used in place of `autoJoin` in the config now for automatically joining rooms.

**v1.7.1**
* Fixed the crash when a user used `/hidelines` or a similar `&`-sent message.
* Accidentally skipped 1.7.0.

**v1.6.1**
* Cleaned up unit tests and removed unnecessary PartProfessor mentions.

**v1.6.0**
* PS-Client now uses both customcolor sources (the same way the actual client does) to read namecolors.
* Added unit tests.

**v1.5.0**
* Add `*.d.ts` files for method documentation.
* Update descriptions in the README.
* `Client#users` and `Client#rooms` are now Maps instead of objects.
* Updated the util.inspect entries for Client/Room/User/Message.
* Massive code cleanup.

**v1.4.1**
* User#sendHTML and User#pageHTML now work correctly.

**v1.4.0**
* Multi-line messages now resolve at the time of the final line being successfully sent, instead of never resolving.
* Some datacenters now use JSON.

**v1.3.0**
* Added various HTML methods to the Message, Room, and User classes.
* Messages that successfully resolve a waitFor promise now have the `awaited` flag set.
* Various properties of the Client, Room, and User classes have now been privatized.
* Additions to Tools, including escapeHTML, unescapeHTML, and parseMessage.
