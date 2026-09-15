import React, { useState } from 'react';
import { 
  RateChartData, 
  RateChartServiceItem, 
  RateScaleDefinition 
} from '../../types/documents';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Check, 
  AlertCircle,
  Copy
} from 'lucide-react';
import { sampleRateChart } from '../../services/sampleData';
import { CurrencyToggle } from '../common/CurrencyToggle';
import { translateDocumentPayload } from '../../services/currency';
import { SignaturePicker } from '../documents/SignaturePicker';

interface RateChartFormProps {
  data: RateChartData;
  onChange: (data: RateChartData) => void;
}

export const RateChartForm: React.FC<RateChartFormProps> = ({ data, onChange }) => {
  const [activeScaleTab, setActiveScaleTab] = useState<Record<string, 'simple' | 'medium' | 'complex'>>({});
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});

  const updateField = <K extends keyof RateChartData>(key: K, value: RateChartData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const getActiveTab = (serviceId: string): 'simple' | 'medium' | 'complex' => {
    return activeScaleTab[serviceId] || 'simple';
  };

  const setActiveTabForService = (serviceId: string, tab: 'simple' | 'medium' | 'complex') => {
    setActiveScaleTab(prev => ({ ...prev, [serviceId]: tab }));
  };

  const toggleServiceExpanded = (serviceId: string) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: prev[serviceId] === undefined ? false : !prev[serviceId]
    }));
  };

  const isExpanded = (serviceId: string): boolean => {
    return expandedServices[serviceId] !== false; // default expanded
  };

  // Service item updates
  const updateServiceItem = (serviceIndex: number, field: keyof RateChartServiceItem, value: any) => {
    const list = [...(data.services || [])];
    list[serviceIndex] = { ...list[serviceIndex], [field]: value };
    updateField('services', list);
  };

  const updateScaleDefinition = (
    serviceIndex: number, 
    scaleKey: 'simple' | 'medium' | 'complex', 
    field: keyof RateScaleDefinition, 
    value: any
  ) => {
    const list = [...(data.services || [])];
    const targetService = { ...list[serviceIndex] };
    targetService[scaleKey] = {
      ...targetService[scaleKey],
      [field]: value
    };
    list[serviceIndex] = targetService;
    updateField('services', list);
  };

  // Add / remove feature or limitation in a scale
  const addScaleListItem = (
    serviceIndex: number, 
    scaleKey: 'simple' | 'medium' | 'complex', 
    listType: 'features' | 'limitations'
  ) => {
    const list = [...(data.services || [])];
    const targetService = { ...list[serviceIndex] };
    const currentArray = [...(targetService[scaleKey][listType] || [])];
    currentArray.push('');
    targetService[scaleKey] = {
      ...targetService[scaleKey],
      [listType]: currentArray
    };
    list[serviceIndex] = targetService;
    updateField('services', list);
  };

  const updateScaleListItem = (
    serviceIndex: number, 
    scaleKey: 'simple' | 'medium' | 'complex', 
    listType: 'features' | 'limitations',
    itemIndex: number,
    value: string
  ) => {
    const list = [...(data.services || [])];
    const targetService = { ...list[serviceIndex] };
    const currentArray = [...(targetService[scaleKey][listType] || [])];
    currentArray[itemIndex] = value;
    targetService[scaleKey] = {
      ...targetService[scaleKey],
      [listType]: currentArray
    };
    list[serviceIndex] = targetService;
    updateField('services', list);
  };

  const removeScaleListItem = (
    serviceIndex: number, 
    scaleKey: 'simple' | 'medium' | 'complex', 
    listType: 'features' | 'limitations',
    itemIndex: number
  ) => {
    const list = [...(data.services || [])];
    const targetService = { ...list[serviceIndex] };
    const currentArray = (targetService[scaleKey][listType] || []).filter((_, idx) => idx !== itemIndex);
    targetService[scaleKey] = {
      ...targetService[scaleKey],
      [listType]: currentArray
    };
    list[serviceIndex] = targetService;
    updateField('services', list);
  };

  // Add service
  const addService = () => {
    const newService: RateChartServiceItem = {
      id: `srv-${Date.now()}`,
      serviceName: 'New Product / Service Offering',
      category: 'General Development',
      description: 'Comprehensive design and implementation service package.',
      simple: {
        scaleName: 'Simple',
        price: 1500,
        timeline: '1 – 2 Weeks',
        description: 'Lean MVP or baseline configuration for basic use-cases.',
        features: ['Core deliverable setup', 'Standard responsive layout', 'Verification & delivery handover'],
        limitations: ['Custom integrations excluded', 'Single revision cycle']
      },
      medium: {
        scaleName: 'Medium',
        price: 4500,
        timeline: '3 – 5 Weeks',
        description: 'Standard commercial build with comprehensive workflows and third-party integrations.',
        features: ['Custom modular architecture', 'Full database integration', 'Staging & production deployment', '3 rounds of revisions'],
        limitations: ['Client provides 3rd party API keys and assets']
      },
      complex: {
        scaleName: 'Complex',
        price: 10000,
        timeline: '6 – 8 Weeks',
        description: 'Enterprise-grade high-throughput solution with security hardening, automation, and SLA warranty.',
        features: ['Bespoke enterprise architecture', 'Automated CI/CD pipelines and testing', 'Compliance & security audit hardening', 'Extended warranty support'],
        limitations: ['Hardware level modifications excluded']
      }
    };
    updateField('services', [...(data.services || []), newService]);
  };

  const duplicateService = (serviceIndex: number) => {
    const original = data.services[serviceIndex];
    const duplicated: RateChartServiceItem = {
      ...JSON.parse(JSON.stringify(original)),
      id: `srv-${Date.now()}`,
      serviceName: `${original.serviceName} (Copy)`
    };
    const nextList = [...data.services];
    nextList.splice(serviceIndex + 1, 0, duplicated);
    updateField('services', nextList);
  };

  const removeService = (serviceIndex: number) => {
    const list = data.services.filter((_, idx) => idx !== serviceIndex);
    updateField('services', list);
  };

  // Commercial terms
  const updateTerm = (index: number, value: string) => {
    const list = [...(data.commercialTerms || [])];
    list[index] = value;
    updateField('commercialTerms', list);
  };

  const addTerm = () => {
    updateField('commercialTerms', [...(data.commercialTerms || []), '']);
  };

  const removeTerm = (index: number) => {
    const list = (data.commercialTerms || []).filter((_, idx) => idx !== index);
    updateField('commercialTerms', list);
  };

  const resetToSample = () => {
    if (confirm('Load sample rate card template? This will replace your current services with standard agency service benchmarks.')) {
      onChange({
        ...sampleRateChart,
        rateChartNumber: data.rateChartNumber || sampleRateChart.rateChartNumber,
        effectiveDate: data.effectiveDate || sampleRateChart.effectiveDate,
        validUntil: data.validUntil || sampleRateChart.validUntil,
        currencySymbol: data.currencySymbol || sampleRateChart.currencySymbol
      });
    }
  };

  return (
    <div className="space-y-6 text-ink-900">
      {/* Form Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-parchment-300">
        <div>
          <h3 className="font-serif text-lg text-ink-950 font-normal">Service Rate Chart Editor</h3>
          <p className="text-xs text-ink-500 font-light">
            Configure transparent tiered pricing across Simple, Medium, and Complex service scopes.
          </p>
        </div>
        <button
          type="button"
          onClick={resetToSample}
          className="flex items-center gap-1.5 text-xs text-clay-700 bg-clay-50 hover:bg-clay-100 px-3 py-1.5 rounded-lg border border-clay-200 transition font-medium"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Benchmarks</span>
        </button>
      </div>

      {/* Metadata & Validity Card */}
      <div className="bg-white border border-parchment-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="text-xs font-serif font-semibold text-ink-950 uppercase tracking-wide flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-clay-600" />
          <span>1. Rate Card Details & Validity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-ink-600 mb-1">Rate Card Title</label>
            <input
              type="text"
              value={data.chartTitle || ''}
              onChange={(e) => updateField('chartTitle', e.target.value)}
              placeholder="e.g. Engineering & Product Development Rate Card"
              className="w-full text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600 font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-ink-600">Rate Card ID</label>
              <span className="text-[10px] text-ink-400 font-mono">Autofilled</span>
            </div>
            <input
              type="text"
              value={data.rateChartNumber || ''}
              readOnly
              disabled
              placeholder="e.g. RC-2026-001"
              className="w-full text-xs p-2 border border-parchment-300 rounded-lg font-mono font-semibold bg-parchment-100/80 text-ink-700 cursor-not-allowed select-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-ink-600 mb-1">Effective Date</label>
            <input
              type="date"
              value={data.effectiveDate || ''}
              onChange={(e) => updateField('effectiveDate', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ink-600 mb-1">Valid Until</label>
            <input
              type="date"
              value={data.validUntil || ''}
              onChange={(e) => updateField('validUntil', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-ink-600 mb-1">Pricing Currency (USD / INR)</label>
            <CurrencyToggle
              value={data.currency || 'USD'}
              onChange={(newCurr) => {
                const translated = translateDocumentPayload({ type: 'rate_chart', data }, newCurr);
                onChange(translated.data as RateChartData);
              }}
              showRateNotice={true}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-ink-600 mb-1">Prepared For / Target Audience</label>
            <input
              type="text"
              value={data.preparedFor || ''}
              onChange={(e) => updateField('preparedFor', e.target.value)}
              placeholder="e.g. Standard Agency Commercial Rates, or Specific Client Name"
              className="w-full text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ink-600 mb-1">Target Organization / Market</label>
            <input
              type="text"
              value={data.clientCompany || ''}
              onChange={(e) => updateField('clientCompany', e.target.value)}
              placeholder="e.g. All Prospective & Retained Clients"
              className="w-full text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-ink-600 mb-1">Introductory Notes & Philosophy</label>
          <textarea
            rows={2}
            value={data.introductoryNotes || ''}
            onChange={(e) => updateField('introductoryNotes', e.target.value)}
            placeholder="Brief overview explaining your tiered pricing model, quality guarantees, or engagement expectations..."
            className="w-full text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600 leading-relaxed"
          />
        </div>
      </div>

      {/* Services List Card */}
      <div className="bg-white border border-parchment-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-serif font-semibold text-ink-950 uppercase tracking-wide flex items-center gap-2">
            <span>2. Services & Complexity Scales ({data.services?.length || 0})</span>
          </div>
          <button
            type="button"
            onClick={addService}
            className="flex items-center gap-1.5 text-xs bg-clay-600 hover:bg-clay-700 text-white px-3 py-1.5 rounded-lg transition font-medium shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
        </div>

        {(!data.services || data.services.length === 0) && (
          <div className="p-8 border border-dashed border-parchment-300 rounded-xl text-center space-y-2">
            <p className="text-xs text-ink-500">No services defined yet in this rate chart.</p>
            <button
              type="button"
              onClick={addService}
              className="text-xs text-clay-700 font-semibold hover:underline"
            >
              + Add First Service
            </button>
          </div>
        )}

        {data.services?.map((service, sIndex) => {
          const currentTab = getActiveTab(service.id);
          const expanded = isExpanded(service.id);
          const currentScale = service[currentTab];

          return (
            <div
              key={service.id || `srv-${sIndex}`}
              className="border border-parchment-200 rounded-xl overflow-hidden bg-white shadow-2xs"
            >
              {/* Service Accordion Header */}
              <div className="bg-parchment-50 p-3 border-b border-parchment-200 flex items-center justify-between">
                <div 
                  className="flex items-center gap-2 flex-1 cursor-pointer"
                  onClick={() => toggleServiceExpanded(service.id)}
                >
                  <button type="button" className="text-ink-400 hover:text-ink-700">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <span className="w-5 h-5 rounded-full bg-clay-100 text-clay-800 text-[10px] font-bold flex items-center justify-center">
                    {sIndex + 1}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-ink-900">
                      {service.serviceName || 'Untitled Service'}
                    </span>
                    {service.category && (
                      <span className="ml-2 text-[10px] bg-parchment-200 text-ink-600 px-1.5 py-0.5 rounded font-medium">
                        {service.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-ink-500 bg-white px-2 py-1 rounded border border-parchment-200">
                    <span>S: {data.currencySymbol}{service.simple?.price || 0}</span>
                    <span>•</span>
                    <span>M: {data.currencySymbol}{service.medium?.price || 0}</span>
                    <span>•</span>
                    <span>C: {data.currencySymbol}{service.complex?.price || 0}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => duplicateService(sIndex)}
                    className="p-1.5 text-ink-400 hover:text-ink-700 rounded transition"
                    title="Duplicate Service"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeService(sIndex)}
                    className="p-1.5 text-rose-400 hover:text-rose-700 rounded transition"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {expanded && (
                <div className="p-4 space-y-4">
                  {/* Service Meta (Name, Category, Description) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-medium text-ink-600 mb-1">Service / Product Name</label>
                      <input
                        type="text"
                        value={service.serviceName || ''}
                        onChange={(e) => updateServiceItem(sIndex, 'serviceName', e.target.value)}
                        placeholder="e.g. Full-Stack Web Application / SaaS Platform"
                        className="w-full text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-ink-600 mb-1">Category</label>
                      <input
                        type="text"
                        value={service.category || ''}
                        onChange={(e) => updateServiceItem(sIndex, 'category', e.target.value)}
                        placeholder="e.g. Software Engineering, Design..."
                        className="w-full text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-ink-600 mb-1">Service Overview & Core Value</label>
                    <input
                      type="text"
                      value={service.description || ''}
                      onChange={(e) => updateServiceItem(sIndex, 'description', e.target.value)}
                      placeholder="Brief 1-line overview of this capability..."
                      className="w-full text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600"
                    />
                  </div>

                  {/* Scale Tabs Switcher: Simple, Medium, Complex */}
                  <div className="border border-parchment-200 rounded-xl p-3.5 bg-parchment-50/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-parchment-200 pb-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
                        Scale Configuration
                      </div>
                      <div className="inline-flex rounded-lg border border-parchment-200 bg-white p-0.5">
                        <button
                          type="button"
                          onClick={() => setActiveTabForService(service.id, 'simple')}
                          className={`text-xs px-3 py-1 rounded-md font-medium transition ${
                            currentTab === 'simple'
                              ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                              : 'text-ink-600 hover:text-ink-900'
                          }`}
                        >
                          Simple Scale
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTabForService(service.id, 'medium')}
                          className={`text-xs px-3 py-1 rounded-md font-medium transition ${
                            currentTab === 'medium'
                              ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200'
                              : 'text-ink-600 hover:text-ink-900'
                          }`}
                        >
                          Medium Scale
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTabForService(service.id, 'complex')}
                          className={`text-xs px-3 py-1 rounded-md font-medium transition ${
                            currentTab === 'complex'
                              ? 'bg-purple-50 text-purple-800 font-semibold border border-purple-200'
                              : 'text-ink-600 hover:text-ink-900'
                          }`}
                        >
                          Complex Scale
                        </button>
                      </div>
                    </div>

                    {/* Active Scale Details */}
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-ink-600 mb-1">
                            Price ({data.currencySymbol || '$'})
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-400 font-mono">
                              {data.currencySymbol || '$'}
                            </span>
                            <input
                              type="number"
                              value={currentScale.price || 0}
                              onChange={(e) => updateScaleDefinition(sIndex, currentTab, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full text-xs pl-7 pr-2 py-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600 font-mono font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-ink-600 mb-1">Turnaround Timeline</label>
                          <input
                            type="text"
                            value={currentScale.timeline || ''}
                            onChange={(e) => updateScaleDefinition(sIndex, currentTab, 'timeline', e.target.value)}
                            placeholder="e.g. 1 – 2 Weeks, 4 – 6 Weeks..."
                            className="w-full text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-ink-600 mb-1">Scale Label</label>
                          <input
                            type="text"
                            value={currentScale.scaleName || ''}
                            onChange={(e) => updateScaleDefinition(sIndex, currentTab, 'scaleName', e.target.value)}
                            className="w-full text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600 capitalize font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-ink-600 mb-1">
                          Scale Scope Explanation & Architecture
                        </label>
                        <textarea
                          rows={2}
                          value={currentScale.description || ''}
                          onChange={(e) => updateScaleDefinition(sIndex, currentTab, 'description', e.target.value)}
                          placeholder="Detailed description of what constitutes this scale..."
                          className="w-full text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600 leading-relaxed"
                        />
                      </div>

                      {/* Inclusions & What it includes */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>What It Includes / Deliverables ({currentScale.features?.length || 0})</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => addScaleListItem(sIndex, currentTab, 'features')}
                            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Deliverable</span>
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {currentScale.features?.map((feat, fIndex) => (
                            <div key={fIndex} className="flex items-center gap-2">
                              <span className="text-[10px] text-emerald-600 font-mono">•</span>
                              <input
                                type="text"
                                value={feat}
                                onChange={(e) => updateScaleListItem(sIndex, currentTab, 'features', fIndex, e.target.value)}
                                placeholder="Included feature or deliverable..."
                                className="flex-1 text-xs p-1.5 border border-parchment-300 rounded-lg focus:outline-none focus:border-emerald-600"
                              />
                              <button
                                type="button"
                                onClick={() => removeScaleListItem(sIndex, currentTab, 'features', fIndex)}
                                className="text-ink-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Limitations & Out of Scope */}
                      <div className="space-y-2 pt-2 border-t border-parchment-200">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-amber-800 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Limitations & Out of Scope ({currentScale.limitations?.length || 0})</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => addScaleListItem(sIndex, currentTab, 'limitations')}
                            className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Limitation</span>
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {currentScale.limitations?.map((lim, lIndex) => (
                            <div key={lIndex} className="flex items-center gap-2">
                              <span className="text-[10px] text-amber-600 font-mono">✕</span>
                              <input
                                type="text"
                                value={lim}
                                onChange={(e) => updateScaleListItem(sIndex, currentTab, 'limitations', lIndex, e.target.value)}
                                placeholder="Scope boundary or limitation..."
                                className="flex-1 text-xs p-1.5 border border-parchment-300 rounded-lg focus:outline-none focus:border-amber-600"
                              />
                              <button
                                type="button"
                                onClick={() => removeScaleListItem(sIndex, currentTab, 'limitations', lIndex)}
                                className="text-ink-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Commercial Terms & Notes */}
      <div className="bg-white border border-parchment-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-serif font-semibold text-ink-950 uppercase tracking-wide">
            3. Commercial Terms & Engagement Framework
          </div>
          <button
            type="button"
            onClick={addTerm}
            className="flex items-center gap-1 text-xs text-clay-700 hover:text-clay-900 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Term</span>
          </button>
        </div>

        <div className="space-y-2">
          {data.commercialTerms?.map((term, tIndex) => (
            <div key={tIndex} className="flex items-start gap-2">
              <span className="text-xs font-mono text-ink-400 mt-2">{tIndex + 1}.</span>
              <textarea
                rows={2}
                value={term}
                onChange={(e) => updateTerm(tIndex, e.target.value)}
                placeholder="Commercial clause, revision policy, IP handover terms..."
                className="flex-1 text-xs p-2 border border-parchment-300 rounded-lg focus:outline-none focus:border-clay-600 leading-relaxed"
              />
              <button
                type="button"
                onClick={() => removeTerm(tIndex)}
                className="text-ink-400 hover:text-rose-600 p-2 mt-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Agency Authorized Signatures from Signature Store */}
      <SignaturePicker
        value={data.agencySigners || { mode: 'dual' }}
        onChange={(selection) => updateField('agencySigners', selection)}
        title="Senior Managing Partner Authorization"
        description="Pick authorized partner signature(s) from your Signature Store to stamp this official rate card schedule. Defaults to Dual Partner execution."
        allowDual={true}
      />
    </div>
  );
};

