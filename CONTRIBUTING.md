# Contributing to Cytosnap

Cytosnap is an open source project, and anyone interested is encouraged to contribute to Cytosnap.  To contribute, [fork](https://help.github.com/articles/fork-a-repo/) Cytosnap, commit your changes, and send a [pull request](https://help.github.com/articles/using-pull-requests/).



## Submitting issues

Submit issues or feature requests to the [issue tracker](https://github.com/cytoscape/Cytosnap/issues).

Before submitting an issue, you should ensure that the issue still exists in the latest version of the library.  Because we follow semver, you can safely upgrade patch releases (x.y.**z**) and feature releases (x.**y**) without worry of breaking API changes.

Clearly describe your issue.  List the steps necessary to reproduce your issue along with the corresponding code (like a snippet or a gist).

Make certain to mention the version of the library you are using and version of Node.js you are using.



## Code style

Use two spaces for indentation, and single-quoted strings are preferred.  The main thing is to  try to keep your code neat and similarly formatted as the rest of the code.  There isn't a strict styleguide.




## Testing

Tests go in the `./test` directory, as Mocha tests usually do.  They are just a flat list of `.js` files that Mocha runs.  If your change is a bugfix, please add a unit test that would fail without your fix.  If your change is a new feature, please add unit tests accordingly.

Please run `npm test` to make sure all the unit tests are passing before you make your pull request.
