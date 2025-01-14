import { XCircleIcon } from '@heroicons/react/20/solid';
import { nanoid } from 'nanoid';
import { memo, FC, useState } from 'react';
import { NodeProps } from 'reactflow';
import useUndo from 'use-undo';
import { shallow } from 'zustand/shallow';

import NodeTemplate from './templates/NodeTemplate';
import { GlobalVariableDataType } from './types/NodeTypes';
import useStore, { selector } from '../store/useStore';
import { conditionalClassNames } from '../utils/classNames';
import { handleChange } from '../utils/handleFormChange';

const GlobalVariable: FC<NodeProps<GlobalVariableDataType>> = (props) => {
	const { data, selected, id, type } = props;
	const [initialValue, setInitialValue] = useState<string | { id: string; value: string }[]>(
		data.initialValue,
	);

	const [name, { set: setName }] = useUndo(data.name);
	const { present: presentName } = name;

	const { updateNode, globalVariables, setGlobalVariables } = useStore(selector, shallow);

	const [showFullScreen, setShowFullScreen] = useState(false);

	const [variableType, setVariableType] = useState<'text' | 'list'>(data.type);

	return (
		<div className="">
			<div
				className={conditionalClassNames(
					data.isDetailMode && 'h-[40rem] w-[35rem]',
					`m-3 shadow-lg`,
				)}
			>
				<NodeTemplate
					{...props}
					title="New Variable"
					fieldName="Name"
					color="slate"
					showFullScreen={showFullScreen}
					setShowFullScreen={setShowFullScreen}
					type={type}
					selected={selected}
				>
					{() => (
						<>
							<input
								type="name"
								name="name"
								className="nodrag block h-16 w-full rounded-md border-0 text-slate-900 shadow-sm ring-inset ring-slate-300 placeholder:text-slate-400 ring-2 focus:ring-inset focus:ring-slate-600 sm:py-1.5 sm:text-xl sm:leading-6"
								value={presentName}
								onChange={(e) => {
									setName(e.target.value);
									updateNode(id, {
										...data,
										name: e.target.value,
									});
									const newGlobalVariables = { ...globalVariables };
									newGlobalVariables[id] = {
										...newGlobalVariables[id],
										name: e.target.value,
									};
									setGlobalVariables(newGlobalVariables);
								}}
							/>

							<div className="py-4">
								<label
									htmlFor="response"
									className="block font-medium leading-6 text-2xl"
								>
									Type:
								</label>
								<fieldset className="mt-2">
									<legend className="sr-only">Variable type</legend>
									<div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
										{['text', 'list'].map((varType) => (
											<div key={varType} className="flex items-center">
												<input
													type="radio"
													checked={varType === variableType}
													onChange={(e) => {
														if (e.target.checked) {
															setVariableType(
																varType as 'text' | 'list',
															);
															const newValue =
																varType === 'text' ? '' : [];

															setInitialValue(newValue);
															updateNode(id, {
																...data,
																type: varType as 'text' | 'list',
																initialValue: newValue,
															});

															const newGlobalVariables = {
																...globalVariables,
																[id]: {
																	...globalVariables[id],
																	type: varType as
																		| 'text'
																		| 'list',
																},
															};
															newGlobalVariables[id] = {
																...newGlobalVariables[id],
															};
															setGlobalVariables(newGlobalVariables);
														}
													}}
													className="h-6 w-6 border-slate-400 text-slate-600 focus:ring-slate-600 cursor-pointer"
												/>
												<label
													htmlFor={varType}
													className="ml-3 block text-2xl font-medium leading-6 text-slate-900 cursor-pointer"
												>
													{varType}
												</label>
											</div>
										))}
									</div>
								</fieldset>
							</div>
							<label
								htmlFor="response"
								className="block font-medium leading-6 text-2xl"
							>
								Initial Value:
							</label>

							{variableType === 'list' && (
								<>
									<div className="nodrag nowheel relative w-full grow overflow-auto">
										<div className="absolute w-full top-0">
											{Array.isArray(initialValue) &&
												initialValue?.map(
													(
														item: { id: string; value: string },
														index: number,
													) => {
														return (
															<div
																key={item.id}
																className="px-1 py-2 flex items-center gap-1 h-14"
															>
																<XCircleIcon
																	className={
																		'text-slate-400 hover:text-slate-500 h-10 w-10 flex-shrink-0'
																	}
																	aria-hidden="true"
																	onClick={() => {
																		// remove the classification
																		if (
																			!Array.isArray(
																				initialValue,
																			)
																		) {
																			return initialValue;
																		}
																		const newValues = [
																			...initialValue,
																		];
																		newValues.splice(index, 1);
																		setInitialValue(newValues);
																		updateNode(id, {
																			...data,
																			initialValue: newValues,
																		});
																		// delete all edges connected to handle with sourceHandle classification.id
																	}}
																/>
																<form className="w-full relative">
																	<div className="relative">
																		<input
																			type="text"
																			name="textType"
																			className={conditionalClassNames(
																				'nodrag block py-2 w-full rounded-md border-0 text-slate-900 shadow-sm ring-inset ring-slate-300 placeholder:text-slate-400 ring-2 focus:ring-inset focus:ring-slate-600 sm:py-1.5 sm:text-xl sm:leading-6',
																			)}
																			value={item.value}
																			onChange={(e) => {
																				if (
																					!Array.isArray(
																						initialValue,
																					)
																				) {
																					return initialValue;
																				}
																				const newValues = [
																					...initialValue,
																				];
																				newValues[
																					index
																				].value =
																					e.target.value;

																				setInitialValue(
																					newValues,
																				);
																				updateNode(id, {
																					...data,
																					initialValue: [
																						...newValues,
																					],
																				});
																			}}
																		/>
																	</div>
																</form>
															</div>
														);
													},
												)}
										</div>
									</div>
									<div className="py-4">
										<button
											className="w-full text-xl border-4 text-center border-dashed border-slate-400 hover:bg-slate-200 active:bg-slate-300 text-slate-400 text-md font-medium py-1 px-2 rounded"
											onClick={(event) => {
												event.stopPropagation();
												event.preventDefault();
												const newValues = [
													...(initialValue as {
														id: string;
														value: string;
													}[]),
													{
														id: nanoid(),
														value: '',
													},
												];
												setInitialValue(newValues);
												updateNode(id, {
													...data,
													initialValue: [...newValues],
												});
											}}
										>
											Add list item
										</button>
									</div>
								</>
							)}
							{variableType === 'text' && (
								<textarea
									rows={4}
									name="initialValue"
									id={`initialValue-${id}`}
									className="nowheel nodrag text-2xl flex-grow w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-1 focus:ring-inset focus:ring-slate-400 sm:leading-10"
									value={initialValue as string}
									onFocus={(e) => {
										e.target.selectionStart = 0;
										e.target.selectionEnd = 0;
									}}
									onChange={(e) => {
										setInitialValue(e.target.value);
										handleChange(e, id, data, updateNode);
									}}
								/>
							)}
						</>
					)}
				</NodeTemplate>
			</div>
		</div>
	);
};

export default memo(GlobalVariable);
