# Autocomplete

Realizes a customizable autocomplete that only handles the autocomplete itself.
The rest ist totally up to you. There are some configuration options and
three callbacks that let you customize every aspect of the autocomplete item
creation to the selection of an item or the appearance of an autocomplete item in the list.

Depends on jQuery. Work in progress.

 ## Initialization:
 Use window.Autocomplete.init({}); in your DOM ready function and maybe
 pass some configuration and override options.

 ## Example markup:
 ```
 <div class="js-autocomplete-group-trigger autocomplete-holder">
    <input type="text" name="autocomplete" />
    <div class="autocomplete-list js-autocomplete-list" autocomplete="off"></div>
 </div>
 ```