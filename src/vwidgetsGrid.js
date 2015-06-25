$.widget( "vwidgets.grid", {
    options: {
      data: [],
        emptyDataMessage: "No data available to show",
        css: { table: "table" },
        headerTemplate: [],
        fieldTemplate: [],
        hidefields: [],
        amalgateColumns: [],
        datetimefields: [],
        showPagination: true,
        paginationPageSize: 5,
        pageSize: 10
    },
    _create: function() {
        this.options.value = this._constrain(this.options.value);
        this.element.addClass( "vwidgetsgrid" );
    },
    _setOption: function( key, value ) {
        if ( key === "value" ) {
            value = this._constrain( value );
        }
        this._super( key, value );
    },
    _setOptions: function( options ) {
        this._super( options );
        this.refresh();
    },
    refresh: function() {
        var progress = this.options.value + "%";
        this.element.text( progress );
        if ( this.options.value == 100 ) {
            this._trigger( "complete", null, { value: 100 } );
        }
    },
    _destroy: function() {
        this.element
            .removeClass( "vwidgetsgrid" )
            .html( "" );
    }
});