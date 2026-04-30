<?php
/**
 * Plugin Name: AIgenciaLab Chatbot
 * Plugin URI: https://aigencialab.cl
 * Description: Chatbot de IA avanzado para WordPress y WooCommerce. Automatiza atención y captura leads.
 * Version: 1.0.0
 * Author: AIgenciaLab
 * Author URI: https://aigencialab.cl
 * License: GPL2
 */

if (!defined('ABSPATH')) exit;

class AIgenciaLab_Chatbot {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_widget_script'));
        
        // WooCommerce Hook
        add_action('woocommerce_after_cart', array($this, 'add_cart_intent_trigger'));
    }

    public function add_admin_menu() {
        add_options_page(
            'AIgenciaLab Bot',
            'AIgenciaLab Bot',
            'manage_options',
            'aigencialab-chatbot',
            array($this, 'settings_page')
        );
    }

    public function register_settings() {
        register_setting('aigencialab_settings_group', 'aigencialab_api_key');
        register_setting('aigencialab_settings_group', 'aigencialab_display_on');
    }

    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>AIgenciaLab Chatbot Settings</h1>
            <form method="post" action="options.php">
                <?php settings_fields('aigencialab_settings_group'); ?>
                <?php do_settings_sections('aigencialab_settings_group'); ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">API Key</th>
                        <td>
                            <input type="text" name="aigencialab_api_key" value="<?php echo esc_attr(get_option('aigencialab_api_key')); ?>" class="regular-text" />
                            <p class="description">Encuentra tu API Key en el <a href="https://aigencialab.cl/dashboard/installation" target="_blank">Dashboard de AIgenciaLab</a>.</p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Mostrar en</th>
                        <td>
                            <select name="aigencialab_display_on">
                                <option value="all" <?php selected(get_option('aigencialab_display_on'), 'all'); ?>>Toda la web</option>
                                <option value="woo" <?php selected(get_option('aigencialab_display_on'), 'woo'); ?>>Solo WooCommerce</option>
                            </select>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function enqueue_widget_script() {
        $api_key = get_option('aigencialab_api_key');
        $display_on = get_option('aigencialab_display_on');
        
        if (!$api_key) return;

        if ($display_on === 'woo' && !is_woocommerce()) return;

        wp_enqueue_script(
            'aigencialab-widget',
            'https://aigencialab.cl/widget/widget.js',
            array(),
            '1.0.0',
            true
        );

        add_filter('script_loader_tag', function($tag, $handle) use ($api_key) {
            if ('aigencialab-widget' !== $handle) return $tag;
            return str_replace(' src', ' data-api-key="' . esc_attr($api_key) . '" src', $tag);
        }, 10, 2);
    }

    public function add_cart_intent_trigger() {
        echo '<script>window.dispatchEvent(new CustomEvent("aigencialab_cart_trigger"));</script>';
    }
}

new AIgenciaLab_Chatbot();
