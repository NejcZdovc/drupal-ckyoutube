/**
 * Youtube Embed Plugin
 *
 * @author Jonnas Fonini <contato@fonini.net>
 * @version 2.0.9
 */

(function ($, Drupal, drupalSettings, CKEDITOR) {

	'use strict';

	CKEDITOR.plugins.add( 'youtube',
	{
		requires: 'dialog',
		init: function( editor )
		{
			editor.ui.addButton( 'Youtube',
			{
				label : Drupal.t('Embed YouTube Video'),
				command : 'youtube',
				icon : this.path + 'images/icon.png'
			});

			editor.addCommand( 'youtube', new CKEDITOR.dialogCommand( 'youtube', {
				allowedContent: 'div{*}; iframe{*}[!width,!height,!src,!frameborder,!allowfullscreen]; object param[*]'
			}));

			CKEDITOR.dialog.add( 'youtube', function ( instance )
			{
				var video;

				return {
					title : Drupal.t('Embed YouTube Video'),
					minWidth : 500,
					minHeight : 200,
					contents :
						[{
							id : 'youtubePlugin',
							expand : true,
							elements :
								[{
									id : 'txtEmbed',
									type : 'textarea',
									label : Drupal.t('Paste Embed Code Here'),
									autofocus : 'autofocus',
									onChange : function ( api )
									{
										handleEmbedChange( this, api );
									},
									onKeyUp : function ( api )
									{
										handleEmbedChange( this, api );
									},
									validate : function ()
									{
										if ( this.isEnabled() )
										{
											if ( !this.getValue() )
											{
												alert( Drupal.t('You must input an embed code or URL') );
												return false;
											}
											else
											if ( this.getValue().length === 0 || this.getValue().indexOf( '//' ) === -1 )
											{
												alert( Drupal.t("The embed code you've entered doesn't appear to be valid") );
												return false;
											}
										}
									}
								},
								{
									type : 'html',
									html : Drupal.t('or') + '<hr>'
								},
								{
									type : 'hbox',
									widths : [ '70%', '15%', '15%' ],
									children :
									[
										{
											id : 'txtUrl',
											type : 'text',
											label : Drupal.t('Paste YouTube Video UR'),
											onChange : function ( api )
											{
												handleLinkChange( this, api );
											},
											onKeyUp : function ( api )
											{
												handleLinkChange( this, api );
											},
											validate : function ()
											{
												if ( this.isEnabled() )
												{
													if ( !this.getValue() )
													{
														alert( Drupal.t('You must input an embed code or URL') );
														return false;
													}
													else{
														video = ytVidId(this.getValue());

														if ( this.getValue().length === 0 ||  video === false)
														{
															alert( Drupal.t("The URL you've entered doesn't appear to be valid") );
															return false;
														}
													}
												}
											}
										},
										{
											type : 'text',
											id : 'txtWidth',
											width : '60px',
											label : Drupal.t('Width'),
											'default' : editor.config.youtube_width != null ? editor.config.youtube_width : '640',
											validate : function ()
											{
												if ( this.getValue() )
												{
													var width = parseInt ( this.getValue() ) || 0;

													if ( width === 0 )
													{
														alert( Drupal.t('Inform a valid height') );
														return false;
													}
												}
												else {
													alert( Drupal.t('You must inform the width') );
													return false;
												}
											}
										},
										{
											type : 'text',
											id : 'txtHeight',
											width : '60px',
											label : Drupal.t('Height'),
											'default' : editor.config.youtube_height != null ? editor.config.youtube_height : '360',
											validate : function ()
											{
												if ( this.getValue() )
												{
													var height = parseInt ( this.getValue() ) || 0;

													if ( height === 0 )
													{
														alert( Drupal.t('Inform a valid height') );
														return false;
													}
												}
												else {
													alert( Drupal.t('You must inform the height') );
													return false;
												}
											}
										}
									]
								},
								{
									type : 'hbox',
									widths : [ '100%' ],
									children :
										[
											{
												id : 'chkResponsive',
												type : 'checkbox',
												label : Drupal.t('Make Responsive (ignore width and height, fit to width)'),
												'default' : editor.config.youtube_responsive != null ? editor.config.youtube_responsive : false
											}
										]
								},
								{
									type : 'hbox',
									widths : [ '55%', '45%' ],
									children :
									[
										{
											id : 'chkRelated',
											type : 'checkbox',
											'default' : editor.config.youtube_related != null ? editor.config.youtube_related : true,
											label : Drupal.t("Show suggested videos at the video's end")
										},
										{
											id : 'chkOlderCode',
											type : 'checkbox',
											'default' : editor.config.youtube_older != null ? editor.config.youtube_older : false,
											label : Drupal.t('Use old embed code')
										}
									]
								},
								{
									type : 'hbox',
									widths : [ '55%', '45%' ],
									children :
									[
										{
											id : 'chkPrivacy',
											type : 'checkbox',
											label : Drupal.t('Enable privacy-enhanced mode'),
											'default' : editor.config.youtube_privacy != null ? editor.config.youtube_privacy : false
										},
										{
											id : 'chkAutoplay',
											type : 'checkbox',
											'default' : editor.config.youtube_autoplay != null ? editor.config.youtube_autoplay : false,
											label : Drupal.t('Autoplay')
										}
									]
								},
								{
									type : 'hbox',
									widths : [ '55%', '45%'],
									children :
									[
										{
											id : 'txtStartAt',
											type : 'text',
											label : Drupal.t('Start at (ss or mm:ss or hh:mm:ss)'),
											validate : function ()
											{
												if ( this.getValue() )
												{
													var str = this.getValue();

													if ( !/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/i.test( str ) )
													{
														alert( Drupal.t('Inform a valid start time') );
														return false;
													}
												}
											}
										},
										{
											id: 'empty',
											type: 'html',
											html: ''
										}
									]
								}
							]
						}
					],
					onOk: function()
					{
						var content = '';
						var responsiveStyle='';

						if ( this.getContentElement( 'youtubePlugin', 'txtEmbed' ).isEnabled() )
						{
							content = this.getValueOf( 'youtubePlugin', 'txtEmbed' );
						}
						else {
							var url = '//', params = [], startSecs;
							var width = this.getValueOf( 'youtubePlugin', 'txtWidth' );
							var height = this.getValueOf( 'youtubePlugin', 'txtHeight' );

							if ( this.getContentElement( 'youtubePlugin', 'chkPrivacy' ).getValue() === true )
							{
								url += 'www.youtube-nocookie.com/';
							}
							else {
								url += 'www.youtube.com/';
							}

							url += 'embed/' + video;

							if ( this.getContentElement( 'youtubePlugin', 'chkRelated' ).getValue() === false )
							{
								params.push('rel=0');
							}

							if ( this.getContentElement( 'youtubePlugin', 'chkAutoplay' ).getValue() === true )
							{
								params.push('autoplay=1');
							}

							startSecs = this.getValueOf( 'youtubePlugin', 'txtStartAt' );
							if ( startSecs ){
								var seconds = hmsToSeconds( startSecs );

								params.push('start=' + seconds);
							}

							if ( params.length > 0 )
							{
								url = url + '?' + params.join( '&' );
							}

							if ( this.getContentElement( 'youtubePlugin', 'chkResponsive').getValue() === true ) {
								content += '<div class="youtube-embed-wrapper" style="position:relative;padding-bottom:56.25%;padding-top:30px;height:0;overflow:hidden;">';
								responsiveStyle = 'style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"';
							}

							if ( this.getContentElement( 'youtubePlugin', 'chkOlderCode' ).getValue() === true )
							{
								url = url.replace('embed/', 'v/');
								url = url.replace(/&/g, '&amp;');

								if ( url.indexOf('?') === -1 )
								{
									url += '?';
								}
								else {
									url += '&amp;';
								}
								url += 'hl=' + (this.getParentEditor().config.language ? this.getParentEditor().config.language : 'en') + '&amp;version=3';

								content += '<object width="' + width + '" height="' + height + '" ' + responsiveStyle + '>';
								content += '<param name="movie" value="' + url + '"></param>';
								content += '<param name="allowFullScreen" value="true"></param>';
								content += '<param name="allowscriptaccess" value="always"></param>';
								content += '<embed src="' + url + '" type="application/x-shockwave-flash" ';
								content += 'width="' + width + '" height="' + height + '" '+ responsiveStyle + ' allowscriptaccess="always" ';
								content += 'allowfullscreen="true"></embed>';
								content += '</object>';
							}
							else {
								content += '<iframe width="' + width + '" height="' + height + '" src="' + url + '" ' + responsiveStyle;
								content += 'frameborder="0" allowfullscreen></iframe>';
							}

							if ( this.getContentElement( 'youtubePlugin', 'chkResponsive').getValue() === true ) {
								content += '</div>';
							}
						}

						var element = CKEDITOR.dom.element.createFromHtml( content );
						var instance = this.getParentEditor();
						instance.insertElement(element);
					}
				};
			});
		}
	});
})(jQuery, Drupal, drupalSettings, CKEDITOR);

function handleLinkChange( el, api ) {
	if ( el.getValue().length > 0 )
	{
		el.getDialog().getContentElement( 'youtubePlugin', 'txtEmbed' ).disable();
	}
	else {
		el.getDialog().getContentElement( 'youtubePlugin', 'txtEmbed' ).enable();
	}
}

function handleEmbedChange( el, api ) {
	if ( el.getValue().length > 0 )
	{
		el.getDialog().getContentElement( 'youtubePlugin', 'txtUrl' ).disable();
	}
	else {
		el.getDialog().getContentElement( 'youtubePlugin', 'txtUrl' ).enable();
	}
}


/**
 * JavaScript function to match (and return) the video Id
 * of any valid Youtube Url, given as input string.
 * @author: Stephan Schmitz <eyecatchup@gmail.com>
 * @url: http://stackoverflow.com/a/10315969/624466
 */
function ytVidId( url ) {
	var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
	return ( url.match( p ) ) ? RegExp.$1 : false;
}

/**
 * Converts time in hms format to seconds only
 */
function hmsToSeconds( time ) {
	var arr = time.split(':'), s = 0, m = 1;

	while (arr.length > 0)
	{
		s += m * parseInt(arr.pop(), 10);
		m *= 60;
	}

	return s;
}
