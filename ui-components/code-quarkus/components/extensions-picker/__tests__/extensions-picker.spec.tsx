import { cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ExtensionEntry, ExtensionsPicker } from '../extensions-picker';
import { filterFunction, sortFunction } from '../extensions-picker-utils';
import { act } from 'react-dom/test-utils';

afterEach(() => {
  cleanup();
});

const entries: ExtensionEntry[] = [
  {
    'id': 'io.quarkus:quarkus-arc',
    'name': 'ArC',
    'version': 'test-version',
    'tags': [],
    'keywords': [
      'arc',
      'cdi',
      'dependency-injection',
      'di',
      'label'
    ],
    'default': false,
    'description': 'Build time CDI dependency injection',
    'shortName': 'CDI',
    'category': 'Core',
    'order': 0,
  },
  {
    'id': 'io.quarkus:quarkus-camel-netty4-http',
    'version': 'test-version',
    'name': 'Camel Netty4 test HTTP',
    'tags': [ 'preview' ],
    'default': false,
    'keywords': [
      'camel-netty4-http',
      'camel'
    ],
    'description': 'Camel support for Netty',
    'category': 'Integration',
    'order': 2,
  },
  {
    'id': 'some-id',
    'version': 'test-version',
    'name': 'A CDI in name test',
    'tags': [ 'experimental' ],
    'default': false,
    'keywords': [
      'lambda',
      'amazon-lambda',
      'aws-lambda',
      'amazon',
      'aws',
      'label'
    ],
    'shortName': 'a shortname',
    'description': 'Some description',
    'category': 'Cloud',
    'order': 1,
  },
];

describe('<ExtensionsPicker />', () => {

  it('renders the ExtensionsPicker correctly', () => {
    const setFilter = jest.fn();
    const comp = render(<ExtensionsPicker placeholder="" entries={entries} value={{ extensions: [] }} onChange={() => { }} buildTool="MAVEN" filter="" setFilter={setFilter}  />);
    expect(comp.asFragment()).toMatchSnapshot();
  });

  it('show results for valid search', async () => {
    const setFilter = jest.fn();
    const comp = render(<ExtensionsPicker placeholder="" entries={entries} value={{ extensions: [] }} onChange={() => { }} buildTool="MAVEN" filter="" setFilter={setFilter} />);

    const searchField = comp.getByLabelText('Search extensions');
    fireEvent.change(searchField, { target: { value: 'CDI' } });
    expect(setFilter).toBeCalledTimes(1);
    expect(setFilter).lastCalledWith('CDI');
    act(() => {
      comp.rerender(<ExtensionsPicker placeholder="" entries={entries} value={{ extensions: [] }} onChange={() => { }} buildTool="MAVEN" filter="CDI" setFilter={setFilter} />);
    });
    const result = await comp.findAllByText(entries[0].description!);
    expect((result as HTMLElement[]).length).toBe(1);
    expect(comp.asFragment()).toMatchSnapshot();
  });

  it('select values and save', async () => {
    const setFilter = jest.fn();
    const handleChange = jest.fn();
    const comp = render(<ExtensionsPicker placeholder="" entries={entries} value={{ extensions: [] }} onChange={handleChange} buildTool="MAVEN" filter="" setFilter={setFilter} />);

    const searchField = comp.getByLabelText('Search extensions');
    fireEvent.change(searchField, { target: { value: 'netty' } });
    expect(setFilter).toBeCalledTimes(1);
    expect(setFilter).lastCalledWith('netty');
    act(() => {
      comp.rerender(<ExtensionsPicker placeholder="" entries={entries} value={{ extensions: [] }} onChange={() => { }} buildTool="MAVEN" filter="netty" setFilter={setFilter} />);
    });
    const item = await comp.findAllByText(entries[1].description!);
    fireEvent.click(item[0]);
    expect(comp.asFragment()).toMatchSnapshot();
  });
});

describe('filterFunction', () => {
  it('when not using a filter, all extensions should be returned', () => {
    expect(entries.filter(filterFunction('')))
      .toEqual(entries);
  });

  it('when using exact shortname, the result should include the other corresponding extensions too', () => {
    expect(entries.filter(filterFunction('cdi')))
      .toEqual([ entries[0], entries[2] ]);
  });

  it('when using start of shortname, the result should include the other corresponding extensions too', () => {
    expect(entries.filter(filterFunction('cd')))
      .toEqual([ entries[0], entries[2] ]);
  });

  it('when using part of name, it should return the corresponding extensions', () => {
    expect(entries.filter(filterFunction('test')))
      .toEqual([ entries[1], entries[2] ]);
  });

  it('when using label, it should return the corresponding extensions', () => {
    expect(entries.filter(filterFunction('label')))
      .toEqual([ entries[0], entries[2] ]);
  });

  it('when using part of label, it should return the corresponding extensions', () => {
    expect(entries.filter(filterFunction('labe')))
      .toEqual([ entries[0], entries[2] ]);
  });

  it('when using part of category (not start), it should not return it', () => {
    expect(entries.filter(filterFunction('oud')))
      .toEqual([]);
  });

  it('when using start of category, it should return it', () => {
    expect(entries.filter(filterFunction('clou')))
      .toEqual([ entries[2] ]);
  });

  it('when using start of tag, it should return it', () => {
    expect(entries.filter(filterFunction('prev')))
      .toEqual([ entries[1] ]);
  });
});

describe('sortFunction', () => {
  it('when using not filter, it should use the order field', () => {
    const sorted = entries.slice(0).sort(sortFunction(''));
    expect(sorted).toEqual([ entries[0], entries[2], entries[1] ]);
  });

  it('when using start of shortname of an extension, it should be first', () => {
    expect(sortFunction('cdi')(entries[0], entries[2]))
      .toEqual(-1);
    expect(sortFunction('cdi')(entries[2], entries[0]))
      .toEqual(1);
  });

  it('when using one of the label of an extension, it should be first', () => {
    expect(sortFunction('amazon')(entries[2], entries[0]))
      .toEqual(-1);
    expect(sortFunction('amazon')(entries[0], entries[2]))
      .toEqual(1);
  });

  it('when using one part of the label of an extension, it should be first', () => {
    expect(sortFunction('amazo')(entries[2], entries[0]))
      .toEqual(-1);
    expect(sortFunction('amazo')(entries[0], entries[2]))
      .toEqual(1);
  });

  it('when using start of the name of an extension, it should be first', () => {
    expect(sortFunction('a')(entries[0], entries[1]))
      .toEqual(-1);
    expect(sortFunction('a')(entries[1], entries[0]))
      .toEqual(1);
  });

  it('when using start of the tags of an extension, it should be first', () => {
    expect(sortFunction('prev')(entries[1], entries[0]))
      .toEqual(-1);
    expect(sortFunction('prev')(entries[0], entries[1]))
      .toEqual(1);
  });

  it('when no match, it should compare the order', () => {
    const sorted = entries.slice(0).sort(sortFunction('anomatch'));
    expect(sorted).toEqual([ entries[0], entries[2], entries[1] ]);
  });

});