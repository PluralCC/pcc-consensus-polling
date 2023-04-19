# frozen_string_literal: true

# name: plural-polis-discourse
# about: TODO
# version: 0.0.3
# authors: PluralCC Developers
# url: TODO1
# required_version: 2.7.0
enabled_site_setting :plural_polis_discourse_enabled
register_asset "stylesheets/common.scss"
register_asset "stylesheets/polis-results.scss"

module ::MyPluginModule
  PLUGIN_NAME = "plural-polis-discourse"
end

require_relative "lib/my_plugin_module/engine"

after_initialize do
  # ===== Block for setting up has_polis field =====
  FIELD_NAME ||= "has_polis"
  FIELD_TYPE ||= "boolean"

  # Register new custom field
  register_topic_custom_field_type(FIELD_NAME, FIELD_TYPE.to_sym)

  # Add field to topic model
  add_to_class(:topic, FIELD_NAME.to_sym) do
    if !custom_fields[FIELD_NAME].nil?
      custom_fields[FIELD_NAME]
    else
      nil
    end
  end

  # Add getter in model to be able to read the attribute
  add_to_class(:topic, "#{FIELD_NAME}=") { |value| custom_fields[FIELD_NAME] = value }

  # Add a setter in model to be able to change the attribute
  on(:topic_created) do |topic, opts, user|
    topic.send("#{FIELD_NAME}=".to_sym, opts[FIELD_NAME.to_sym])
    topic.save!
  end

  # Changes for update
  PostRevisor.track_topic_field(FIELD_NAME.to_sym) do |tc, value|
    tc.record_change(FIELD_NAME, tc.topic.send(FIELD_NAME), value)
    tc.topic.send("#{FIELD_NAME}=".to_sym, value.present? ? value : nil)
  end

  # Serialize the field
  add_to_serializer(:topic_view, FIELD_NAME.to_sym) { object.topic.send(FIELD_NAME) }

  # Preload the field
  add_preloaded_topic_list_custom_field(FIELD_NAME)

  # Serialize to the topic list
  add_to_serializer(:topic_list_item, FIELD_NAME.to_sym) { object.send(FIELD_NAME) }

  # ===== END Block for setting up has_polis field =====

  Discourse::Application.routes.append do
    namespace :pcc_api do
      get "/polis_comments/:conversation_id" => "polis#comments"
      post "/vote_comment" => "polis#vote_comment"
    end
  end

  # enable associated accounts for ETH login
  SiteSetting.include_associated_account_ids = true

  # ====== Add emails to current user serializer ======
  add_to_serializer(:current_user, "primary_email".to_sym) { object.send("primary_email") }
  # ====== END Add emails to current user serializer ======
end

extend_content_security_policy(script_src: ["https://pol.is/embed.js"])
