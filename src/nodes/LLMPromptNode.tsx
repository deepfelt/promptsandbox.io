import { memo, FC, useState } from 'react';
import { Handle, Position, NodeProps, NodeToolbar } from 'reactflow';
import { shallow } from 'zustand/shallow';
import useUndo from 'use-undo';

import useStore, { selector } from '../store/useStore';
import { handleChange } from '../utils/handleFormChange';
import { LLMPromptNodeDataType, CustomNode, NodeTypesEnum } from './types/NodeTypes';
import RunButton from '../components/RunButton';
import { conditionalClassNames } from '../utils/classNames';
import { Disclosure, Switch } from '@headlessui/react';
import { PauseIcon, SignalIcon } from '@heroicons/react/20/solid';

const LLMPrompt: FC<NodeProps<LLMPromptNodeDataType>> = ({ data, selected, id }) => {
	const [
		textState,
		{
			set: setText,
			// reset: resetText,
			// undo: undoText,
			// redo: redoText,
			// canUndo, canRedo
		},
	] = useUndo(data.prompt);
	const { present: presentText } = textState;

	const { updateNode, openAIApiKey, getInputNodes } = useStore(selector, shallow);
	const [showPrompt, setshowPrompt] = useState(true);

	// TODO: Fullscreen button to edit prompts with a larger display
	return (
		<div className="">
			<div
				style={{
					height: showPrompt ? '40rem' : '5rem',
					width: '35rem',
				}}
				className={`m-3 bg-slate-50 shadow-lg border-2  ${
					selected ? 'border-amber-600' : 'border-slate-300'
				} flex flex-col`}
			>
				<NodeToolbar offset={0} isVisible={data.isBreakpoint || selected}>
					{/* TODO: Breakpoints */}
					<div className="flex gap-2 justify-end items-center text-md">
						<button
							className={conditionalClassNames(
								data.isBreakpoint
									? 'bg-red-900 text-red-500'
									: 'bg-yellow-20/50 text-slate-500 border-1 border-yellow-500',
								'  text-md font-semibold py-1 px-2 rounded flex items-center',
							)}
							onClick={() => {
								data.isBreakpoint = !data.isBreakpoint;
								updateNode(id, data);
							}}
						>
							<PauseIcon
								className={conditionalClassNames(
									data.isBreakpoint ? 'text-red-500' : 'text-yellow-500',
									' -ml-1 mr-1 h-5 w-5 flex-shrink-0 text-red-100',
								)}
								aria-hidden="true"
							/>
							<span>{!data.isBreakpoint && 'Set'} Breakpoint</span>
						</button>
						<RunButton
							text="Run Node"
							apiKey={openAIApiKey}
							id={id}
							data={data}
							updateNode={updateNode}
						/>
					</div>
				</NodeToolbar>
				<div className="bg-yellow-200 py-1 flex justify-between items-center pr-4">
					<div className="flex gap-2 items-center">
						<h1 className="text-start pl-4">
							<span className="font-semibold">LLM:</span> {data.name}
						</h1>
						{data.isLoading && (
							<svg
								className="animate-spin -ml-1 mr-3 h-7 w-7 text-black"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						)}
					</div>
					<Switch.Group as="div" className="flex items-center">
						<Switch
							checked={showPrompt}
							onChange={setshowPrompt}
							className={conditionalClassNames(
								showPrompt ? 'bg-green-600' : 'bg-gray-200',
								'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ',
							)}
						>
							<span
								aria-hidden="true"
								className={conditionalClassNames(
									showPrompt ? 'translate-x-5' : 'translate-x-0',
									'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
								)}
							/>
						</Switch>
						<Switch.Label as="span" className="ml-3 text-xs font-medium text-gray-900">
							show prompt
						</Switch.Label>
					</Switch.Group>
				</div>
				{showPrompt && (
					<div className="h-full">
						{/* list of data.inputs string Set */}
						<div className="h-full flex flex-col gap-1 p-4 text-gray-900">
							<label htmlFor="prompt" className="block font-medium leading-6 ">
								Prompt:
							</label>
							<textarea
								rows={4}
								name="prompt"
								id={`prompt-${id}`}
								className="nodrag flex-grow w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-slate-400 sm:leading-6"
								value={presentText}
								onFocus={(e) => {
									e.target.selectionStart = 0;
									e.target.selectionEnd = 0;
								}}
								onChange={(e) => {
									setText(e.target.value);
									handleChange(e, id, data, updateNode, NodeTypesEnum.llmPrompt);
								}}
							/>
							<div className="flex flex-col gap-2 text-md ">
								<div className="flex gap-2 flex-wrap">
									{getInputNodes(data.inputs.inputs).map(
										(inputNode: CustomNode) => {
											const colorClass = conditionalClassNames(
												inputNode.type === 'textInput' &&
													'bg-emerald-600 text-white hover:bg-emerald-700 border-l-8 border-emerald-400',
												inputNode.type === 'llmPrompt' &&
													'bg-amber-600 text-white hover:bg-amber-700  border-l-8 border-amber-400',
												`rounded py-1 px-2 font-semibold shadow-sm `,
											);
											return (
												<div key={inputNode.id}>
													<button
														type="button"
														// convert below to use color for both bg and text
														className={colorClass}
														onClick={() => {
															// append {{inputNode.data.name}} to textarea
															const prompt = document.getElementById(
																`prompt-${id}`,
															) as HTMLTextAreaElement;
															// insert in the current text cursor position
															const start = prompt.selectionStart;
															const end = prompt.selectionEnd;
															const text = prompt.value;
															const before = text.substring(0, start);
															const after = text.substring(
																end,
																text.length,
															);
															prompt.value = `${before}{{${inputNode.data.name}}}${after}`;

															setText(prompt.value);
															// focus on the text cursor position after the inserted text
															prompt.focus();

															prompt.selectionStart =
																start +
																4 +
																inputNode.data.name.length;
															prompt.selectionEnd =
																start +
																4 +
																inputNode.data.name.length;

															return updateNode(id, {
																...data,
																prompt: prompt.value,
															});
														}}
													>
														{inputNode.data.name}
													</button>
												</div>
											);
										},
									)}
								</div>
							</div>
							{/* <div className="flex gap-2 justify-end items-center">
							<button
								className="bg-red-500 hover:bg-red-600 text-white text-md font-semibold py-1 px-2 my-2 rounded flex items-center"
								// onClick={getResponse()}
							>
								<PauseIcon
									className={conditionalClassNames(
										' -ml-1 mr-1 h-5 w-5 flex-shrink-0 text-red-100',
									)}
									aria-hidden="true"
								/>
								<span>Set Breakpoint</span>
							</button>
							<RunButton
								text="Run Node"
								apiKey={openAIApiKey}
								id={id}
								data={data}
								inputNodes={data.inputs.inputNodes}
								updateNode={updateNode}
							/>
						</div> */}
						</div>
					</div>
				)}
			</div>
			{showPrompt && (
				<Disclosure
					as="div"
					className="space-y-1 absolute w-full"
					defaultOpen={data.response.length > 0}
				>
					{({ open }) => (
						<div className="mx-3">
							<Disclosure.Button
								className={conditionalClassNames(
									open ? 'border-b-slate-300' : '',
									'flex justify-between border-1 border-slate-400 bg-slate-200 text-gray-900 group px-2 w-full items-center rounded-t-md py-2 pr-2 text-left text-md font-extrabold',
								)}
								disabled={data.response.length === 0}
							>
								<p className="flex gap-1 items-center pl-2">
									<SignalIcon
										className={conditionalClassNames(
											data.response.length > 0
												? 'text-green-500'
												: 'text-slate-400',
											' -ml-1 mr-1 h-7 w-7 flex-shrink-0',
										)}
										aria-hidden="true"
									/>
									<span
										className={conditionalClassNames(
											data.response.length === 0 && 'text-slate-400',
										)}
									>
										Current results:
									</span>
								</p>

								{/* expand svg */}
								{data.response.length > 0 && (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
										className={conditionalClassNames(
											open ? 'transform rotate-180' : '',
											'h-6 w-6',
										)}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M4.5 15.75l7.5-7.5 7.5 7.5"
										/>
									</svg>
								)}
							</Disclosure.Button>
							<Disclosure.Panel className="space-y-1 mb-10">
								<div
									className="p-3 bg-slate-50 border-1 border-t-0 
							border-slate-400 rounded-b-lg flex flex-col justify-between gap-4"
								>
									<p>{data.response}</p>
								</div>
							</Disclosure.Panel>
						</div>
					)}
				</Disclosure>
			)}
			<Handle
				type="target"
				position={Position.Left}
				id="text-input"
				className="w-4 h-4"
			></Handle>
			<Handle type="source" position={Position.Right} id="text-output" className="w-4 h-4" />
		</div>
	);
};

export default memo(LLMPrompt);
