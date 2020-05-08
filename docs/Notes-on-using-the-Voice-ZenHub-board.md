## Pipelines

Issues travel will follow more or less follow [ZenHub's use strategy](https://www.zenhub.com/blog/how-the-zenhub-team-uses-zenhub-boards-on-github/), with a few tweeks:

- No weekly triage will be held for items in New Issues, instead we can do one of two things:

  - discuss the issue in the comments until the PO is able to determine whether to add it to the Backlog, or close it with an Icebox label.

  - hold a triage meeting if there are >7 items in this column.

- an Icebox label will be used instead of an "Icebox" pipeline to minimise clutter (issues will be closed, but can easily be reviewed and reopened by filtering for the Icebox label).

- Issues in the Backlog ought to be _ordered_ (by the PO) rather than prioritized. In some cases a lower priority issued might be ordered before a higher priority ones if that issue needs to be addressed first, so that for instance other work is not blocked. (More info [here](https://www.barryovereem.com/myth-5-in-scrum-the-product-backlog-is-prioritized/))

- If an item is in Review/QA, (where applicable) an admin should be able to perform an Update Release on staging and see the work.

- The Done column has been removed as it's unnecessary clutter. If a dev has moved an item into Review, it means from their PoV it is done. If the PO is satisfied they can close the issue, if not they can move it back to In Progress with a comment on what the devs need to address in order to close the issue.


## Framework for dividing of labour (& filtering)

### Issues

  - A smallish task that, on the whole, should be completable in under a week (anything larger should probably be broken down into smaller components).

### Epics

  - Medium & large pieces of work comprised of sub-issues, that are, nevertheless, completable (ie. there is a fixed (roughly speaking) objective rather than being indefinitely ongoing).


### Releases

  - The selection of issues that constitute the current development cycle/release plan.


### Labels

  - used to categories "non-ending" work (eg. bugs will continue to arise)

Note: P labels have been added, but I have to admit I'd lean _slightly_ towards getting rid of them as I'm not fully convinced by their use and feel that top to bottom pipeline ordering is a more effective (dynamic) tool.


## Adding issues

Before adding an issue, check the "Icebox" label/search for keywords to make sure it's not a duplicate issue.

### Templates

Templates are aides to support rather than to bog you down in admin. Where issues are obvious they don't have to be used, or where relevant certain portions of them can (and should) be deleted.

That said, they have been added for a reason: to help make sure we have clearly defined issues and cut down on confusion.

### Estimates

 - 1 - an hours or so
 - 3 - several hours
 - 7 - a full day
 - 16 - a couple of days or so
 - 42 - a week
 - 101 - will probably get run over by a cow before completion

If the task falls into >16 territory check it's it's really an Epic that should be broken down into smaller issues.

