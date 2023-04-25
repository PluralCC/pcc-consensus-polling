import { withPluginApi } from "discourse/lib/plugin-api";
import { alias } from "@ember/object/computed";
import { fieldInputTypes, isDefined } from "../lib/topic-custom-field";

export default {
  name: "topic-custom-field-initializer",
  initialize(container) {
    /**
     * ===== Block for setting up hasPolis field =====
     */
    const hasPolisField = "has_polis";
    const fieldType = "boolean";

    withPluginApi("0.11.2", (api) => {
      // Show an input in the composer. Set the actions and properties it'll need in the
      // composer connector template.
      api.registerConnectorClass(
        "composer-fields",
        "composer-topic-custom-field-container",
        {
          setupComponent: function (attrs, component) {
            const model = attrs.model;

            // If the first post is being edited we need to pass our value from
            // the topic model to the composer model.
            if (
              !isDefined(model[hasPolisField]) &&
              model.topic &&
              model.topic[hasPolisField]
            ) {
              model.set(hasPolisField, model.topic[hasPolisField]);
            }

            let props = {
              hasPolisField,
              hasPolisValue: model.get(hasPolisField),
              isCreatingTopic: model.post?.post_number === 1
            };
            component.setProperties(
              Object.assign(props, fieldInputTypes(fieldType))
            );
          },

          actions: {
            onChangeField(hasPolisValue) {
              this.set(`model.${hasPolisField}`, hasPolisValue);
            },
          },
        }
      );

      // Show an input in topic title edit. Set the actions and properties it'll need in the edit
      // topic connector template.
      api.registerConnectorClass(
        "edit-topic",
        "edit-topic-custom-field-container",
        {
          setupComponent(attrs, component) {
            const model = attrs.model;

            let props = {
              hasPolisField,
              hasPolisValue: model.get(hasPolisField),
              isCreatingTopic: model.post?.post_number === 1
            };
            component.setProperties(
              Object.assign(props, fieldInputTypes(fieldType))
            );
          },

          actions: {
            onChangeField(hasPolisValue) {
              this.set(`buffered.${hasPolisField}`, hasPolisValue);
            },
          },
        }
      );

      // Serialize your field to the server
      api.serializeOnCreate(hasPolisField);
      api.serializeToDraft(hasPolisField);
      api.serializeToTopic(hasPolisField, `topic.${hasPolisField}`);

      // Display your field value
      api.registerConnectorClass(
        "topic-title",
        "topic-title-custom-field-container",
        {
          setupComponent(attrs, component) {
            const model = attrs.model;
            const controller = container.lookup("controller:topic");

            component.setProperties({
              hasPolisField,
              hasPolisValue: model.get(hasPolisField),
              showField:
                !controller.get("editingTopic") &&
                isDefined(model.get(hasPolisField)),
              isCreatingTopic: model.post?.post_number === 1
            });

            controller.addObserver("editingTopic", () => {
              if (this._state === "destroying") {
                return;
              }
              component.set(
                "showField",
                !controller.get("editingTopic") &&
                  isDefined(model.get(hasPolisField))
              );
            });

            model.addObserver(hasPolisField, () => {
              if (this._state === "destroying") {
                return;
              }
              component.set("hasPolisValue", model.get(hasPolisField));
            });
          },
        }
      );

      // Setup the topic list item component
      api.modifyClass("component:topic-list-item", {
        hasPolisName: hasPolisField,
        hasPolisValue: alias(`topic.${hasPolisField}`),
      });
    });
    /**
     * ===== END Block for setting up has_polis field =====
     */
  },
};
