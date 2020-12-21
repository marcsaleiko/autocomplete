/**
 * Autocomplete
 *
 * Realizes a customizable autocomplete that only handles the autocomplete itself.
 * The rest ist totally up to you. There are some configuration options and
 * three callbacks that let you customize every aspect of the autocomplete item
 * creation to the selection of an item or the appearance of an autocomplete item in the list.
 *
 * Initialization:
 * Use window.Autocomplete.init({}); in your DOM ready function and maybe
 * pass some configuration and override options.
 *
 * Example markup:
 * <div class="js-autocomplete-group-trigger autocomplete-holder">
 *   <input type="text" name="autocomplete" />
 *   <div class="autocomplete-list js-autocomplete-list" autocomplete="off"></div>
 * </div>
 *
 */
window.Autocomplete = (function(){

    var _init = false;
    var settings = {
      triggerSelector: '.js-autocomplete-group-trigger',
      listSelector: '.js-autocomplete-list',
      listActiveClass: 'autocomplete-list--active',
      listItemClass: 'autocomplete-item',
      listItemSelectorClass: 'js-autocomplete-item',
      listItemSelector: '.js-autocomplete-item',
      noItemsContainerClass: 'autocomplete-message',
      noItemsMessage: 'Keine passenden Einträge gefunden.',
      minInputLength: 2,
      requestDelay: 200,
      clearInputOnSelect: true,
      hideListOnSelect: true,
      requestCallback: function(){},
      asyncRequest: false,
      requestEachItemCallback: false,
      onSelectCallback: function(){},
    };
    var $items = false;
    var ajaxTimer = -1;
    var $openAutocompleteList = false;
    var app = {};
  
    app.init = function( options ) {
      if( _init ) { return; }
      _init = true;
  
      settings = $.extend( settings, options );
      $items = $( settings.triggerSelector );
      if( $items.length > 0 ) {
        $(document).on('click touch', settings.listItemSelector, onItemClick );
        $(document).on('click touch', onDocumentClick );
  
        $items.find('input')
          .on('keyup', onInputKeyUp )
          .on('focus', onInputFocus );
      }
    };
  
    /**
     * Closes an autocomplete list if any is open
     */
    app.close = function() {
      if( $openAutocompleteList !== false ) {
        $openAutocompleteList.removeClass( settings.listActiveClass );
        $openAutocompleteList = false;
      }
    };
  
    app.addSuggests = function( items, $autocomplete ) {
      addSuggestItemsToContainer(items, $autocomplete);
    };
  
    /**
     * Handles the autocomplete behavior and listens to key presses.
     * @param e
     */
    var onInputKeyUp = function( e ) {
      var charCode = (e.which) ? e.which : e.keyCode
      var $this = $(this);
      // esc key
      if( charCode === 27 || $this.val().length < settings.minInputLength ) {
        getItemList( $this ).removeClass( settings.listActiveClass );
        $openAutocompleteList = false;
      } else {
        window.clearTimeout( ajaxTimer )
        ajaxTimer = window.setTimeout( handleAutocompleteRequest, settings.requestDelay, $this );
      }
    };
  
    /**
     * Reinit the autocomplete on focus if there already was an input.
     * @param e
     */
    var onInputFocus = function( e ) {
      if( $openAutocompleteList === false ) {
        var $this = $(this);
        if( $this.val().length >= settings.minInputLength ) {
          window.clearTimeout( ajaxTimer )
          ajaxTimer = window.setTimeout( handleAutocompleteRequest, settings.requestDelay, $this );
        }
      }
    };
  
    /**
     * Will be triggered if the user clicks on a autocomplete item.
     * @param e
     */
    var onItemClick = function( e ) {
      var $this = $( this );
      var $container = $this.closest(settings.triggerSelector);
      var $input = $container.find('input');
      var $list = getItemList($input);
      var value = $this.data('value');
      if( typeof settings.onSelectCallback === "function" ) {
        settings.onSelectCallback( value, $this, $container, $input, $list );
      }
      if( settings.hideListOnSelect === true ) {
        $list.removeClass( settings.listActiveClass );
        $openAutocompleteList = false;
      }
      if( settings.clearInputOnSelect === true ) {
        $input.val('');
      }
      $input.focus();
    };
  
    /**
     * Checks for clicks on the document if an autocomplete list is open.
     * Closes the dialog if the click was outside the input oder the dialog.
     * @param e
     */
    var onDocumentClick = function( e ) {
      if( $openAutocompleteList !== false ) {
        var $target = $( e.target );
        if( $target.parents(settings.triggerSelector).length === 0 ) {
          $openAutocompleteList.removeClass( settings.listActiveClass );
          $openAutocompleteList = false;
        }
      }
    };
  
    /**
     * Central logic for building the autocomplete list.
     * @param $this
     */
    var handleAutocompleteRequest = function( $this ) {
      ajaxTimer = -1;
      var $container = getItemContainer( $this );
      if( typeof settings.requestCallback === "function" ) {
        if( settings.asyncRequest ) {
          // just trigger the request callback and expect it to run addSuggests() on its own
          settings.requestCallback( $this.val(), $container, $this );
        }
        else {
          addSuggestItemsToContainer(settings.requestCallback( $this.val(), $container, $this ), $this);
        }
      }
    };
  
    /**
     * Adds the actual autocomplete items to the suggest container
     * @param autocompleteItems
     * @param $this Reference to the current autocomplete instance
     */
    var addSuggestItemsToContainer = function(autocompleteItems, $this) {
      var $autocompleteList = getItemList( $this );
      $autocompleteList.html('');
      $.each( autocompleteItems, function() {
        var html;
        if( typeof settings.requestEachItemCallback === "function" ) {
          html = settings.requestEachItemCallback( this );
        }
        else {
          html = '<div class="'+settings.listItemClass+' '+settings.listItemClass+'--type-'+this.type+' '+settings.listItemSelectorClass+'" data-value="'+this.uid+'">'+this.name+'</div>';
        }
        $autocompleteList.append(html);
      });
      if( autocompleteItems.length === 0 ) {
        $autocompleteList.append('<div class="'+settings.noItemsContainerClass+'">'+settings.noItemsMessage+'</div>');
      }
      $openAutocompleteList = $autocompleteList;
      $autocompleteList.addClass( settings.listActiveClass );
    };
  
    /**
     * Get container and store it in data attribute for caching
     *
     * @param $item
     * @returns {*}
     */
    var getItemContainer = function( $item ) {
      var $container = $item.data('autocompleteContainer');
      if( typeof $container === 'undefined' ) {
        $container = $item.closest( settings.triggerSelector );
        $item.data('autocompleteContainer', $container );
      }
      return $container;
    };
  
    /**
     * Get autocomplete list and store it in data attribute for caching
     *
     * @param $item
     * @returns {jQuery|any|Element}
     */
    var getItemList = function( $item ) {
      var $list = $item.data('autocompleteList');
      if( typeof $list === 'undefined' ) {
        $list = getItemContainer( $item ).find( settings.listSelector );
        $item.data('autocompleteList', $list );
      }
      return $list;
    };
  
  
    return app;
  
  })();