import { Node } from "reactflow";
import { models } from "../../../../../openai/models";
import ChipsInput from "../../../inputs/ChipsInput";

import RangeInput from "../../../inputs/RangeInput";

export default function ApiPromptTab({
  selectedNode,
  handleChange,
}: {
  selectedNode: Node | null;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <>
      {selectedNode && (
        <div>
          {/* form div scrollable using tailwind */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="">
              <label
                htmlFor="model"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Model
              </label>
              <select
                id="model"
                name="model"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
                value={selectedNode.data.model}
                onChange={handleChange}
              >
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <RangeInput
              numberValue={selectedNode.data.temperature}
              propertyName={"temperature"}
              handleChange={handleChange}
            />

            <RangeInput
              numberValue={selectedNode.data.max_tokens}
              propertyName={"max_tokens"}
              handleChange={handleChange}
              min={1}
              max={4000}
              step={1}
            />

            <RangeInput
              numberValue={selectedNode.data.top_p}
              propertyName={"top_p"}
              handleChange={handleChange}
            />
            <RangeInput
              numberValue={selectedNode.data.frequency_penalty}
              propertyName={"frequency_penalty"}
              handleChange={handleChange}
            />
            <RangeInput
              numberValue={selectedNode.data.presence_penalty}
              propertyName={"presence_penalty"}
              handleChange={handleChange}
            />

            <RangeInput
              numberValue={selectedNode.data.best_of}
              propertyName={"best_of"}
              handleChange={handleChange}
              min={1}
              max={20}
              step={1}
            />
            <ChipsInput />
          </form>
        </div>
      )}
    </>
  );
}