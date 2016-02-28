<?php

/**
 * @file
 * Definition of \Drupal\ckyoutube\Plugin\CKEditorPlugin\CodeButton.
 */

namespace Drupal\ckyoutube\Plugin\CKEditorPlugin;

use Drupal\ckeditor\CKEditorPluginInterface;
use Drupal\ckeditor\CKEditorPluginButtonsInterface;
use Drupal\Component\Plugin\PluginBase;
use Drupal\editor\Entity\Editor;

/**
 * Defines the "Youtube" plugin.
 *
 * @CKEditorPlugin(
 *   id = "youtube",
 *   label = @Translation("Youtube")
 * )
 */
class Youtube extends PluginBase implements CKEditorPluginInterface, CKEditorPluginButtonsInterface {

    function getDependencies(Editor $editor) {
        return array();
    }

    function getLibraries(Editor $editor) {
        return array();
    }

    function isInternal() {
        return FALSE;
    }

    function getFile() {
        return drupal_get_path('module', 'ckyoutube') . '/js/plugins/youtube/plugin.js';
    }

    function getButtons() {
        return array(
            'Youtube' => array(
                'label' => t('Youtube'),
                'image' => drupal_get_path('module', 'ckyoutube') . '/js/plugins/youtube/images/icon.png'
            )
        );
    }

    public function getConfig(Editor $editor) {
        return array();
    }
}
